pragma solidity ^0.5.0;

contract SSI {
  uint public docCount = 0;
  struct Document{
      uint id;
      string user_did;
      string did;
      string ipfs;
      string signature;
      bool status;
  }
mapping(uint => Document) public documents;


  function addDocument(string memory user_did, string memory did, string memory ipfs) public {
      documents[docCount] = Document(docCount, user_did, did, ipfs, "", false);
      docCount++;
  }

  function getDocCount() public view returns (uint) {
    return docCount;
  }
  function getDocument(uint id) public view returns (string memory user_did,string memory did, string memory ipfs,bool status) {
      Document memory doc = documents[id];
      return (doc.user_did,doc.did,doc.ipfs,doc.status);
  }
  function verifyDocument(uint id,string memory user_did, string memory did, string memory ipfs, string memory signature) public {
      documents[id] = Document(id,user_did,did,ipfs,signature,true);
  }
  function totalDocuments() public view returns (uint){
    return docCount;
  }

  // function evaluateRequest(string memory user_did) public {
  //     delete index;
  //     for(uint i = 0; i <= docCount; i++){
  //         if(keccak256(abi.encodePacked((documents[i].user_did))) == keccak256(abi.encodePacked((user_did)))){
  //             index.push(i);
  //         }
  //     }
  // }

function showAllDocs(string memory user_did) public view returns (uint){
      uint index;
      index = 1;
      for(uint i = 0; i <= docCount; i++){
          if(keccak256(abi.encodePacked((documents[i].user_did))) == keccak256(abi.encodePacked((user_did)))){
              index = index*100 + i;
          }
      }
      return index;
}
}

