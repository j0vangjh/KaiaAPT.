// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RealEstateNFT is ERC721 {
    struct FractionalOwnership {
        uint256 tokenId;
        address owner;
        uint256 ownershipPercentage;
    }

    FractionalOwnership[] public fractionalOwners;
    ERC20 public stablecoin;
    uint256 public constant MAX_OWNERSHIP_PERCENTAGE = 10;

    constructor(address stablecoinAddress) ERC721("Real Estate NFT", "REALESTATE") {
        stablecoin = ERC20(stablecoinAddress);
    }

    function mintProperty(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function buyFraction(uint256 tokenId, uint256 percentage, uint256 price) public {
        require(percentage > 0 && percentage <= MAX_OWNERSHIP_PERCENTAGE, "Invalid percentage");
        require(price > 0, "Invalid price");

        // Calculate the total ownership percentage for this tokenId
        uint256 totalOwnership = 0;
        for (uint256 i = 0; i < fractionalOwners.length; i++) {
            if (fractionalOwners[i].tokenId == tokenId) {
                totalOwnership += fractionalOwners[i].ownershipPercentage;
            }
        }

        // Ensure the total ownership does not exceed 100%
        require(totalOwnership + percentage <= 100, "Total ownership cannot exceed 100%");

        // Transfer stablecoin from the buyer to the contract
        stablecoin.transferFrom(msg.sender, address(this), price);

        // Add the new fractional ownership
        fractionalOwners.push(FractionalOwnership(tokenId, msg.sender, percentage));
    }

    function getOwnershipDetails(uint256 tokenId) public view returns (FractionalOwnership[] memory) {
        FractionalOwnership[] memory owners = new FractionalOwnership[](fractionalOwners.length);
        uint256 count = 0;

        for (uint256 i = 0; i < fractionalOwners.length; i++) {
            if (fractionalOwners[i].tokenId == tokenId) {
                owners[count] = fractionalOwners[i];
                count++;
            }
        }

        // Resize the array to the actual number of owners
        assembly {
            mstore(owners, count)
        }

        return owners;
    }
}