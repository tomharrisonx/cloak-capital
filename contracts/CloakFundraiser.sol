// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, ebool, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC7984} from "@openzeppelin/confidential-contracts/interfaces/IERC7984.sol";
import {IERC7984Receiver} from "@openzeppelin/confidential-contracts/interfaces/IERC7984Receiver.sol";

contract CloakFundraiser is IERC7984Receiver, ZamaEthereumConfig {
    string private _campaignName;
    uint64 private _targetAmount;
    uint64 private _endTime;
    bool private _ended;

    address private _owner;
    IERC7984 private _weth;

    euint64 private _totalRaised;
    mapping(address => euint64) private _contributions;

    event CampaignUpdated(string name, uint64 targetAmount, uint64 endTime);
    event ContributionRecorded(address indexed contributor, euint64 amount, bytes data);
    event FundraisingEnded(address indexed owner, uint64 timestamp);
    event Withdrawn(address indexed owner, euint64 amount);

    error NotOwner();
    error CampaignEnded();
    error InvalidToken();
    error InvalidEndTime();

    modifier onlyOwner() {
        if (msg.sender != _owner) revert NotOwner();
        _;
    }

    constructor(address weth, string memory name_, uint64 targetAmount_, uint64 endTime_) {
        if (weth == address(0)) revert InvalidToken();
        _owner = msg.sender;
        _weth = IERC7984(weth);
        _setCampaign(name_, targetAmount_, endTime_);

        _totalRaised = FHE.asEuint64(0);
        FHE.allowThis(_totalRaised);
        FHE.allow(_totalRaised, _owner);
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function token() external view returns (address) {
        return address(_weth);
    }

    function campaignName() external view returns (string memory) {
        return _campaignName;
    }

    function targetAmount() external view returns (uint64) {
        return _targetAmount;
    }

    function endTime() external view returns (uint64) {
        return _endTime;
    }

    function isEnded() external view returns (bool) {
        return _ended;
    }

    function isActive() public view returns (bool) {
        return !_ended && block.timestamp < _endTime;
    }

    function totalRaised() external view returns (euint64) {
        return _totalRaised;
    }

    function contributionOf(address contributor) external view returns (euint64) {
        return _contributions[contributor];
    }

    function updateCampaign(string calldata name_, uint64 targetAmount_, uint64 endTime_) external onlyOwner {
        if (_ended) revert CampaignEnded();
        _setCampaign(name_, targetAmount_, endTime_);
    }

    function endFundraising() external onlyOwner {
        if (!_ended) {
            _ended = true;
            if (block.timestamp < _endTime) {
                _endTime = uint64(block.timestamp);
            }
            emit FundraisingEnded(_owner, uint64(block.timestamp));
        }

        _withdraw();
    }

    function onConfidentialTransferReceived(
        address,
        address from,
        euint64 amount,
        bytes calldata data
    ) external override returns (ebool) {
        if (msg.sender != address(_weth)) {
            return FHE.asEbool(false);
        }
        if (!isActive()) {
            return FHE.asEbool(false);
        }

        euint64 current = _contributions[from];
        if (!FHE.isInitialized(current)) {
            current = FHE.asEuint64(0);
        }

        euint64 updatedContribution = FHE.add(current, amount);
        _contributions[from] = updatedContribution;
        FHE.allowThis(updatedContribution);
        FHE.allow(updatedContribution, from);
        FHE.allow(updatedContribution, _owner);

        euint64 updatedTotal = FHE.add(_totalRaised, amount);
        _totalRaised = updatedTotal;
        FHE.allowThis(updatedTotal);
        FHE.allow(updatedTotal, _owner);

        emit ContributionRecorded(from, amount, data);
        return FHE.asEbool(true);
    }

    function _withdraw() internal {
        euint64 balance = _weth.confidentialBalanceOf(address(this));
        if (!FHE.isInitialized(balance)) {
            emit Withdrawn(_owner, FHE.asEuint64(0));
            return;
        }
        euint64 transferred = _weth.confidentialTransfer(_owner, balance);
        emit Withdrawn(_owner, transferred);
    }

    function _setCampaign(string memory name_, uint64 targetAmount_, uint64 endTime_) internal {
        if (endTime_ <= block.timestamp) revert InvalidEndTime();
        _campaignName = name_;
        _targetAmount = targetAmount_;
        _endTime = endTime_;
        emit CampaignUpdated(name_, targetAmount_, endTime_);
    }
}
