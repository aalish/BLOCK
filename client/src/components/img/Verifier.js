import React, { Component } from 'react'
import './verifier.css'
import TimeAgo from 'react-timeago'
import VerifierSSI from "../contracts/VerifierSSI.json";
import getWeb3 from "../utils/getWeb3";
import IPFS from 'ipfs-core'
import eccrypto from 'eccrypto';
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const arrayBufferToHex = require("array-buffer-to-hex");

class EvaluateIpfs extends Component {
    async getdata_ipfs(data_id){
        //console.log("BICH MA XHU");
        //console.log(data_id);
        //console.log("YO HO DATA");
        const node = await IPFS.create({repo: 'ok' + Math.random()})

        const dat = node.cat(data_id)
        console.log("YAHA BHITRA");
        console.log(dat);
        return(dat);
    }
    render(){
        if(this.props.addressObj)
        
        for (let index = 0; index < this.props.addressObj.length; index++) {
            // decrypting the messageHex
            let messageHex = JSON.parse(this.props.addressObj[index].address);
            //console.log('messageHex')
            //console.log(messageHex)
            let boxDecode = Buffer.from(messageHex.boxHex, "hex");
            let nonceDecode = Buffer.from(messageHex.nonceHex, "hex");
            // decoding the cryptography
            const verifier_privateKey = Buffer.from(this.props.privateKey, "hex");
            const user_publicKey = Buffer.from(messageHex.user_publicKey, "hex");
            const payload = nacl.box.open(
              boxDecode,
              nonceDecode,
              user_publicKey,
              verifier_privateKey
            );
            // decrypted object
            let ipfsAddress = nacl.util.encodeUTF8(payload)
           
            //const ipfs =  IPFS.create({repo: 'ok' + Math.random()});
            //const data =  ipfs.files.read(ipfsAddress)
            
            //const node = await IPFS.create()

            //const data = node.cat(ipfsAddress)
            console.log("BICH MA XHU");
            console.log(ipfsAddress);
            console.log("YO HO DATA");
            const data = this.getdata_ipfs(ipfsAddress);

            //console.log("DATA AAYO HOLA HAI")
            // convert Buffer back to string
            /*let storage = {};
            // console.log(JSON.parse(data));
            storage = JSON.parse(localStorage.getItem("ipfsDetails"));
            if(!storage){
                storage = {};
            }
            storage[this.props.addressObj[index].index] = JSON.parse(data);
            // console.log(storage)*/
            localStorage.setItem("ipfsDetails", JSON.stringify(data));


            // console.log(JSON.parse(localStorage.getItem('ipfsDetails')))
            /*const node = new IPFS()
            node.once('ready', () => {
                node.cat(ipfsAddress, (err, data) => {
                    if (err) return console.error(err);
                    console.log(JSON.parse(data))
                    // convert Buffer back to string
                    let storage = {};
                    // console.log(JSON.parse(data));
                    storage = JSON.parse(localStorage.getItem("ipfsDetails"));
                    if(!storage){
                        storage = {};
                    }
                    storage[this.props.addressObj[index].index] = JSON.parse(data);
                    // console.log(storage)
                    localStorage.setItem("ipfsDetails", JSON.stringify(storage));


                    // console.log(JSON.parse(localStorage.getItem('ipfsDetails')))
                });
            })
            */

            }
            let ipfsDetail = JSON.parse(localStorage.getItem('ipfsDetails')); 
            console.log(ipfsDetail)
        if(!ipfsDetail)
            ipfsDetail = [];
        return( 

            Object.entries(ipfsDetail).map((pair,i) => {
               //return(
                
                <div key={i} className="modal fade" id={"exampleModal" + pair[0]} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document" style={{ maxWidth: '800px' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">{pair[1].title}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Name: {pair[1].name}</p>
                                <p>Phone: {pair[1].phone}</p>
                                <p>Email: {pair[1].email}</p>
                                <p>User DID: {pair[1].user_did}</p>
                                <p>Document DID: {pair[1].doc_did}</p>
                                <p>Signature: {pair[1].signature}</p>
                                <p>Status: {(pair[1].review) ? 'Reviewed' : 'Not Reviewed'}</p>

                                <img className="img-responsive" height="600px" width="400px" src={pair[1].image} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                
                
              })
            

        )
        
    }
}

class RenderAcceptedRequests extends Component {
    render() {
        return (
            this.props.requests.map((req, i) => (
                
                <tr key={i}>
                    <td className={req.removed ? 'verifier-strike-removed' : ''} ><h6>{req.u_did}</h6></td>
                    <td className={req.removed ? 'verifier-strike-removed' : ''} ><h6>{req.docs}</h6></td>
                    <td className={req.removed ? 'verifier-strike-removed' : ''} ><h6><TimeAgo date={req.req_at} /></h6></td>
                    <td>
                    {
                            (req.removed === true) ? <div className="dash-remove-btn float-right">REMOVED</div> 
                            : 
                            <span>
                                    {!req.review && <span>
                                        <button style={{ textTransform: 'uppercase', fontWeight: 'bold' }} onClick={() => this.props.handleReject(req.request_id)} className="btn btn-danger float-right ml-2">reject</button>
                                        <button style={{ textTransform: 'uppercase', fontWeight: 'bold' }} onClick={() => this.props.handleApprove(req.request_id)} className="btn btn-success float-right ml-2">approve</button> </span>
                                    }
                                    {req.review && <span>
                                        {(req.review && req.status) ? <button className="btn btn-success float-right ml-2">approved</button>
                                            : <button style={{ textTransform: 'uppercase', fontWeight: 'bold' }} className="btn btn-danger float-right ml-2">rejected</button>} </span>
                                    }
                                    <button className="verifer-req-btn float-right" style={{ margin: 0, paddingRight: '30px', paddingLeft: '30px' }} data-toggle="modal" data-target={"#exampleModal" + req.request_id}>preview</button>
                            </span>
                    }
                        
                    </td>

                </tr>
            ))
    
        )
    }
}
 
class RenderPendingRequests extends Component {
    state = {
        ipfsObj: null,
    }
    render() {

        return (
            this.props.requests.map((req, i) => (

                <tr className={req.removed ? 'verifier-strike-removed' : ''} style={{ fontWeight: 500}} key={i}>
                    <td><h6>{req.u_did}</h6></td>
                    <td><h6>{req.docs}</h6></td>
                    <td><h6><TimeAgo date={req.req_at} /></h6></td>
                </tr>
            ))

        )
    }
}

class Verifier extends Component {
    state = {
        web3: null,
        accounts: null,
        VerifierSSI_contract: null,
        refresh: false,
        company:'Pay Nepal',
        did:'6G237080B7F911E9BCCD03A2106A727R',
        user_did:null,
        listOfDoc:null,
        acceptedRequest:[],
        pendingRequest:[],
        acceptedIpfsAddress:[],
        privateKey:null,
        publicKey:null,
    }
    
    handleKeyChange = (e) => {
        this.setState({user_did:e.target.value});
    }
    handleDocChange = (e) => {
        this.setState({ listOfDoc:e.target.value});
    }
    handleRequest = async () => {
        const { accounts, VerifierSSI_contract } = this.state;
        let comp_and_doc = this.state.listOfDoc + ';' + this.state.company;
        await VerifierSSI_contract.methods.makeRequest(this.state.user_did, this.state.publicKey, comp_and_doc,Date()).send({ from: accounts[0] });
        // await contract.methods.evaluateRequest(this.state.user_did).send({ from: accounts[0] });
        // let show = await contract.methods.showRequest().call();
        window.location.reload(false);
    }

    handleApprove = async (request_id) => {
        const { accounts, VerifierSSI_contract } = this.state;
        await VerifierSSI_contract.methods.verifyDocument(request_id, true, true).send({ from: accounts[0] });
        window.location.reload(false);
    }

    handleReject = async (request_id) => {
        const { accounts, VerifierSSI_contract } = this.state;
        await VerifierSSI_contract.methods.verifyDocument(request_id, true, false).send({ from: accounts[0] });
        window.location.reload(false);
    }
    componentDidMount = async () => {
        try {
            let cookie = document.cookie;
            let cookieArr = cookie.split('; ');
            let value = [];
            cookieArr.forEach(arr => {
                let content = arr.split('=');
                value[content[0]] = content[1];

            });
            if (!value['V_privateKey']) {
                // Generating Cryptographic credentials
                // A new random 32-byte private key.
                let privateKey = eccrypto.generatePrivate();
                // privateKey to Hex
                let privateHex = privateKey.toString('hex')

                // Corresponding uncompressed (65-byte) public key.
                // we are generating public key from the nacl(Salt) and to convert it to hex we have used another library 
                let publicKey = nacl.box.keyPair.fromSecretKey(privateKey).publicKey;
                // generating public key hex
                let publicHex = arrayBufferToHex(publicKey);
                this.setState({ publicKey: publicHex, privateKey: privateHex })
                // saving details
                document.cookie = `V_privateKey = ${privateHex}`;
                document.cookie = `V_publicKey = ${publicHex}`;
            } else {
                this.setState({ publicKey: value['V_publicKey'], privateKey: value['V_privateKey'] })
            }

            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = VerifierSSI.networks[networkId];
            const instance = new web3.eth.Contract(
                VerifierSSI.abi,
                deployedNetwork && deployedNetwork.address,
            );
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({ web3, accounts, VerifierSSI_contract: instance });

            // latest Requests
            const VerifierSSI_contract = this.state.VerifierSSI_contract;
            let reqCount = await VerifierSSI_contract.methods.showAllRequest().call();
            let request_details = [];
            let acceptedIpfsAddress = [];
            if (reqCount.length) {
                for (let i = 1; i <= reqCount; i++){
                    request_details[0] = (await VerifierSSI_contract.methods.getIndividualRequestForVerifier(i).call());
                    // check verifier did with comping request did so that same requester match
                    console.log(request_details[0])
                    // separate company and documents
                    let comp_and_doc = request_details[0].comp_and_doc;

                    request_details[0].docs = comp_and_doc.split(';')[0];
                    request_details[0].company = comp_and_doc.split(';')[1];
                    request_details[0].request_id = i;
                    // console.log(request_details[0])
                    if(request_details[0].encAddress){
                        let obj = [];
                        obj['address'] = request_details[0].encAddress;
                        obj['index'] = i;
                        acceptedIpfsAddress = [...acceptedIpfsAddress,obj];
                        
                        this.setState({ acceptedRequest: [...this.state.acceptedRequest, request_details[0]] })
                    }
                    else 
                    this.setState({ pendingRequest: [...this.state.pendingRequest, request_details[0]] })
                }
                this.setState({acceptedIpfsAddress})
                
            }

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }
    render() {

        return (
            <div>
                <div className="verifier-entire">
                    <div className="dash-nav">
                        <div className= 'Nepal-Government-Contract-Board'>
                            <h1 className="dash-title">Nepal Government Contract Board</h1>
                        </div>
                        <div>
                           <button onClick={this.handleLogout} className="verifer-logout-btn">Logout</button>
                    </div>
                    </div>
                    <div className="verifier-header">
                        <div className="main-header">
                            <div className="verifier">
                                <div className="verifier_logo" />
                               
                            </div>
                            <div className="make-request-div">
                                <div style={{ width: '500px' }}>
                                    <label style={{ fontSize: '20px', color:'white' }}>REQUEST NEW DOCUMENT</label>
                                    <input onChange={this.handleKeyChange} className="publicKeyInput form-control" style={{ marginBottom: '5px' }} type="text" placeholder="Enter public key" />
                                    <input onChange={this.handleDocChange} className="publicKeyInput form-control" type="text" placeholder="Enter Document Name" />
                                </div>
                                <button onClick={this.handleRequest} className="verifer-req-btn">Make Request</button>
                            </div>
                        </div>
                    </div>

                    <div className="verifier_content">
                        <div className="recent-lists">
                            <h2 style={{ marginBottom: '4vh', fontWeight:500 }}>Accepted Requests</h2>
                            <table className="table">
                                <thead className="">
                                    <tr>
                                        <th><h5>Account</h5></th>
                                        <th><h5>Document</h5></th>
                                        <th><h5>Arrived </h5></th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    <RenderAcceptedRequests requests={this.state.acceptedRequest} handleApprove={(request_id) => this.handleApprove(request_id)} handleReject={(request_id) => this.handleReject(request_id)}/>
                                    <EvaluateIpfs addressObj={this.state.acceptedIpfsAddress} privateKey={this.state.privateKey}/>
                                </tbody>
                            </table>
                        </div>
                        <div className="history" style={{ marginTop: '15px', fontWeight:500 }}>
                            <h2 style={{ marginBottom: '4vh' }}>Pending Requests</h2>
                            <table className="table">
                                <thead className="verifer-table-header">
                                    <tr>
                                        <th><h5>Account</h5></th>
                                        <th><h5>Document</h5></th>
                                        <th><h5>Arrived</h5></th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    <RenderPendingRequests requests={this.state.pendingRequest} handleClickSend={this.handleClickSend} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
 
            </div>
        )
    }
}

export default Verifier;