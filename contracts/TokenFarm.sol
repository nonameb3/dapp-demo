pragma solidity >=0.4.21 <0.6.0;

import "./DiaToken.sol";
import "./DappToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    address public owner;
    DiaToken public diaToken;
    DappToken public dappToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public isStaking;
    mapping(address => bool) public hasStaked;
    
    // Reward tracking
    mapping(address => uint) public stakingStartTime;
    mapping(address => uint) public lastRewardCalculation;
    mapping(address => uint) public accumulatedRewards;
    
    // Proportional reward system  
    uint public dailyRewardPool = 273972602739726027397; // ~274 DAPP tokens per day (100k/365) in wei
    uint public totalStakedAmount = 0; // Track total staked DIA
    uint public lastRewardDistribution = 0; // Track when rewards were last distributed
    uint constant SECONDS_PER_DAY = 24 * 60 * 60; // 86,400

    constructor(DiaToken _diaToken, DappToken _dappToken) public {
        diaToken = _diaToken;
        dappToken = _dappToken;
        owner = msg.sender;
        lastRewardDistribution = block.timestamp;
    }
    
    // Calculate user's share of rewards based on their proportion of total staked
    // Formula: User_Reward = (User_Staked / Total_Staked) × Daily_Reward_Pool × Time_Fraction
    function calculateRewards(address user) internal view returns (uint) {
        if (!isStaking[user] || stakingBalance[user] == 0 || totalStakedAmount == 0) {
            return 0;
        }
        
        uint timeElapsed = block.timestamp - lastRewardCalculation[user];
        
        // Calculate rewards based on time elapsed (more granular than daily)
        // Formula: (user_stake / total_stake) × daily_pool × (seconds_elapsed / seconds_per_day)
        uint userShare = (stakingBalance[user] * dailyRewardPool * timeElapsed) / (totalStakedAmount * SECONDS_PER_DAY);
        
        return userShare;
    }

    // Get pool statistics for frontend (maintain compatibility)
    function getPoolStats() public view returns (
        uint256 totalStaked,
        uint256 dailyRewards,
        uint256 annualRewards,
        uint256 yourDailyReward,
        uint256 yourAnnualReward
    ) {
        return (
            totalStakedAmount,
            dailyRewardPool,
            dailyRewardPool * 365, // Annual reward pool
            0, // Will be calculated in frontend for specific user
            0  // Will be calculated in frontend for specific user
        );
    }
    
    // Update accumulated rewards for a user
    function updateRewards(address user) internal {
        if (isStaking[user] && stakingBalance[user] > 0) {
            accumulatedRewards[user] += calculateRewards(user);
        }
        lastRewardCalculation[user] = block.timestamp;
    }

    // stake token
    function stakeTokens(uint _token) public {
        require(_token > 0, '_token must more then zero.');

        // Update rewards before changing staking balance
        updateRewards(msg.sender);

        // transfer dia to this contract
        diaToken.transferFrom(msg.sender, address(this), _token);

        // update stake
        stakingBalance[msg.sender] += _token;
        totalStakedAmount += _token; // Track total for APR calculation

        // add user to array (onetime)
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
            stakingStartTime[msg.sender] = block.timestamp;
        }

        // update status and reward tracking
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
        lastRewardCalculation[msg.sender] = block.timestamp;
    }

    // unstake specific amount of tokens
    function unStakeTokens(uint _amount) public {
        require(_amount > 0, 'Amount must be greater than zero');
        require(stakingBalance[msg.sender] >= _amount, 'Insufficient staked balance');

        // Update rewards before changing staking balance
        updateRewards(msg.sender);

        // Transfer the specified amount back to user
        diaToken.transfer(msg.sender, _amount);

        // Update staking balance
        stakingBalance[msg.sender] -= _amount;
        totalStakedAmount -= _amount; // Update total for APR calculation

        // If user has no more staked tokens, set isStaking to false
        if (stakingBalance[msg.sender] == 0) {
            isStaking[msg.sender] = false;
        }
    }

    // unstake all tokens (legacy function for compatibility)
    function unStakeAllTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, 'account is empty balance');

        // Update rewards before unstaking all
        updateRewards(msg.sender);

        diaToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;
        totalStakedAmount -= balance; // Update total for APR calculation
        isStaking[msg.sender] = false;
    }


    // Claim accumulated rewards
    function claimRewards() public {
        // Update rewards to include latest accumulation
        updateRewards(msg.sender);
        
        uint rewards = accumulatedRewards[msg.sender];
        require(rewards > 0, 'No rewards to claim');
        
        // Reset accumulated rewards
        accumulatedRewards[msg.sender] = 0;
        
        // Transfer DAPP tokens as rewards
        dappToken.transfer(msg.sender, rewards);
    }

    // issue Token (owner-only function for manual reward distribution)
    function issueToken() public {
        require(owner == msg.sender, 'must be owner');

        for(uint i=0; i<stakers.length; i++ ) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];

            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }

    // Get total pending rewards (accumulated + current period)
    function getPendingRewards(address user) public view returns (uint256) {
        return accumulatedRewards[user] + calculateRewards(user);
    }
    
    // Get detailed staking information
    function getUserStakingInfo(address user) public view returns (uint256 stakedAmount, bool stakingStatus) {
        return (stakingBalance[user], isStaking[user]);
    }
    
    // Get comprehensive staking data for frontend
    function getUserStakingData(address user) public view returns (
        uint256 stakedAmount, 
        bool stakingStatus, 
        uint256 pendingRewards,
        uint256 stakingStartTime_,
        uint256 userDailyReward
    ) {
        uint256 dailyReward = 0;
        if (totalStakedAmount > 0 && stakingBalance[user] > 0) {
            dailyReward = (stakingBalance[user] * dailyRewardPool) / totalStakedAmount;
        }
        
        return (
            stakingBalance[user], 
            isStaking[user], 
            getPendingRewards(user),
            stakingStartTime[user],
            dailyReward
        );
    }
    
    // Get user's projected rewards for frontend display
    function getUserProjectedRewards(address user) public view returns (
        uint256 dailyReward,
        uint256 monthlyReward,
        uint256 annualReward,
        uint256 sharePercentage
    ) {
        if (totalStakedAmount == 0 || stakingBalance[user] == 0) {
            return (0, 0, 0, 0);
        }
        
        uint256 daily = (stakingBalance[user] * dailyRewardPool) / totalStakedAmount;
        uint256 monthly = daily * 30;
        uint256 annual = daily * 365;
        uint256 share = (stakingBalance[user] * 10000) / totalStakedAmount; // Basis points
        
        return (daily, monthly, annual, share);
    }

    function getUserDiaBalance(address user) public view returns (uint256) {
        return diaToken.balanceOf(user);
    }

    function getUserDappBalance(address user) public view returns (uint256) {
        return dappToken.balanceOf(user);
    }
    
    // Owner functions to manage the reward system
    function setDailyRewardPool(uint256 _newDailyPool) public {
        require(owner == msg.sender, 'must be owner');
        dailyRewardPool = _newDailyPool;
    }
    
    function setAnnualRewardPool(uint256 _newAnnualPool) public {
        require(owner == msg.sender, 'must be owner');
        dailyRewardPool = _newAnnualPool / 365; // Convert annual to daily
    }

}
