pragma solidity ^0.5.0;

contract DiaToken {
    string public name = "Mock DAI Token";
    string public symbol = "mDIA";
    address public owner;
    uint256 public totalSupply = 1000000000000000000000000; // 1 million tokens(Wei)
    uint8 public decimals = 18;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public {
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom( address _from, address _to, uint256 _value ) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    // Faucet function for demo - allows anyone to mint 10 DIA tokens
    function faucet() public returns (bool success) {
        uint256 faucetAmount = 10 * (10**uint256(decimals)); // 10 DIA tokens
        balanceOf[msg.sender] += faucetAmount;
        totalSupply += faucetAmount;
        emit Transfer(address(0), msg.sender, faucetAmount);
        return true;
    }
}
