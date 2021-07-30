
pragma solidity ^0.5.0;

contract VerifierSSI{
    uint public reqCount = 0;
  struct Request{
      uint id;
      string user_did;
      string V_publicKey;
      string comp_and_doc;
      string encAddress;
      string request_at;
      bool removed;
      bool review;
      bool status;
  }
mapping(uint => Request) public requests;

Request[] arrRequest;

function makeRequest(string memory user_did, string memory V_publicKey,string memory comp_and_doc, string memory request_at) public{
  reqCount++;
  requests[reqCount] = Request(reqCount,user_did,V_publicKey,comp_and_doc,"",request_at,false,false,false);
  arrRequest.push(requests[reqCount]);
}

function acceptedByUser(uint id,string memory encAddress) public {
    Request memory req = requests[id];
    requests[id] = Request(id,req.user_did,req.V_publicKey,req.comp_and_doc,encAddress,req.request_at,false,false,true);
}

function showRequest(string memory user_did) public view returns (uint){
      uint index;
      index = 1;
    for(uint i = 1; i <= reqCount; i++){
        if(keccak256(abi.encodePacked((requests[i].user_did))) == keccak256(abi.encodePacked((user_did)))){
            index = index * 100 + i;
        }
    }
      return index;
}

function showAllRequest() public view returns (uint){
    return reqCount;
}

function getIndividualRequest(uint id) public view returns (string memory u_did,string memory V_publicKey, string memory comp_and_doc,string memory req_at,bool removed,bool review, bool status){
    Request memory req = requests[id];
    return(req.user_did,req.V_publicKey,req.comp_and_doc,req.request_at,req.removed,req.review,req.status);
}

function getIndividualRequestForVerifier(uint id) public view returns (string memory u_did,string memory V_publicKey, string memory comp_and_doc,string memory encAddress,string memory req_at,bool removed,bool review, bool status){
    Request memory req = requests[id];
    return(req.user_did,req.V_publicKey,req.comp_and_doc,req.encAddress,req.request_at,req.removed,req.review,req.status);
}

function verifyDocument(uint id,bool review,bool status) public {
    Request memory req = requests[id];
    requests[id] = Request(id,req.user_did,req.V_publicKey,req.comp_and_doc,req.encAddress,req.request_at,req.removed,review,status);
}

function removeRequest(uint id) public {
    Request memory req = requests[id];
    requests[id] = Request(id,req.user_did,req.V_publicKey,req.comp_and_doc,req.encAddress,req.request_at,true,req.review,req.status);

}

}
