import React, { Component } from 'react'
//import uuid from 'uuid'
import { v1 as uuid } from 'uuid';
// import { Redirect } from 'react-router-dom'
import TimeAgo from 'react-timeago'
import IPFS from 'ipfs-core'
// import {Cookies} from 'react-cookie';
import './dashboard.css';
import SSI from "../contracts/SSI.json";
import VerifierSSI from "../contracts/VerifierSSI.json";
import getWeb3 from "../utils/getWeb3";

const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
//const arrayBufferToHex = require("array-buffer-to-hex");
const arrayBufferToHex = require("array-buffer-to-hex");
const RenderRequests = (props) => {
    return (
            props.requests.map((req,i) => (
                <tr key={i}>
                    <td className={req.removed ? 'verifier-strike-removed' : ''} ><h6>{req.company}</h6></td>
                    <td className={req.removed ? 'verifier-strike-removed' : ''} ><h6>{req.docs}</h6></td>
                    <td className={req.removed ? 'verifier-strike-removed' : ''} ><h6><TimeAgo date={req.req_at}/></h6></td>
                    <td style={{float:'right'}}>
                        {
                            (!req.review) ? 
                                (!req.review && req.status) ? 
                                    <button className="btn btn-info">Pending</button> : 
                                    (!req.removed && <button onClick={() => props.handleClickSend(req, i)} className="btn btn-info">send document</button>)
                            :
                            (req.review && req.status) ? 
                                <button className="btn btn-success">document accepted</button>
                                : <button  className="btn btn-danger ">document rejected</button>
                        }
                        {req.removed ? <div className="dash-remove-btn">REMOVED</div>
                        :
                        <div onClick={() => props.handleRemove(req)} className="dash-remove-btn">REMOVE</div>
                        }
                        
                    </td>
                </tr>
            ))
    )
}

class Dashboard extends Component {
    state = {
        user: {},
        demo: null,
        imageState:null,
        image:null,
        did:null,
        title:null,
        web3:null,
        accounts:null,
        SSI_contract:null,
        VerifierSSI_contract:null,
        uploadDoc:true,
        request_index:null,
        requests:[],
        sending_details: null,
        sending_document:null,
        send_status:false,
        sendingDocId:null,
        ipfsHash:null,
        ipfsMessage: null,
        refresh:false,
        docs: [],
        loading:true,
        sending_btn:false,
    }

    handleRemove = async (doc) => {
        console.log('test')
        console.log(doc)
        const { accounts, VerifierSSI_contract } = this.state;
        await VerifierSSI_contract.methods.removeRequest(doc.request_id).send({ from: accounts[0] });


// re render the requests
    window.location.href = 'http://localhost:3000/dashboard';
    }
    // add new document 
    handleForm = async(e) => {
        e.preventDefault();
        const { accounts, SSI_contract } = this.state;
        console.log('clicked');
        let docArray = JSON.parse(localStorage.getItem('documents'));
        if(docArray === null) {
            docArray = {}
        }
        // every document has unique did
        let did = uuid().replace(/-/g, "");
        
        const docId = await SSI_contract.methods.getDocCount().call();
        // store the document locally
        docArray[this.state.title] = {
            doc_id: docId,
            user_did: this.state.user.did,
            did: did,
            title:this.state.title,
            image:this.state.image,
            name:this.state.user.name,
            address:this.state.user.address,
            email:this.state.user.email,
            phone:this.state.user.phone,
            review:false,
            status:0,
            issuer_did:null,
            signature:null,
            created_at:new Date(),
            verified_at:null,
        }
        // create an IPFS
        const ipfs = await IPFS.create({repo: 'ok' + Math.random()});
        const {cid} = await ipfs.add(JSON.stringify(docArray[this.state.title]))
        console.log(cid)
        this.setState({ ipfsHash: cid });

        // node.once("ready", () => {
        //   // convert  data to a Buffer and add it to IPFS
        //   node.add(
        //     IPFS.Buffer.from(JSON.stringify(docArray[this.state.title])),
        //     async (err, files) => {
        //       if (err) return console.error(err);

        //       // 'hash', known as CID, is a string uniquely addressing the data
        //       // and can be used to get it again. 'files' is an array because
        //       // 'add' supports multiple additions, but we only added one entry
        //       console.log(files[0].hash);
        //       this.setState({ ipfsHash: files[0].hash });


        //       // write document did to the blockchain
        //       await SSI_contract.methods
        //         .addDocument(this.state.user.did, did, files[0].hash)
        //         .send({ from: accounts[0] });
        //     }
        //   );
        // });


    // write document did to the blockchain
    await SSI_contract.methods
    .addDocument(this.state.user.did, did, cid)
    .send({ from: accounts[0] });

        
    localStorage.setItem('documents', JSON.stringify(docArray));
    console.log(docArray)
    console.log('test')
    this.setState({ uploadDoc: true })
        
    }
    handleTitle = (e) => {
        this.setState({title:e.target.value});
    }
    handleFormPopUp = () => {
        this.setState({ uploadDoc: false })
    }
    handleFile = (e) => {
        let reader = new FileReader();
        reader.onload = () => {
            this.setState({
                imageState: true,
                image: reader.result
            });
        }
        reader.readAsDataURL(e.target.files[0])
    }
    handleClickSend = (req,i) => {
        this.setState({ sending_details:req,send_status:true})
    }
    handleCloseSend = () => {
        this.setState({ send_status: false })
    }
    handleChangeSend = (e) => {
        if(e.target.value == 0){
            this.setState({sending_btn:false})
        } else{
            this.setState({sending_btn:true, sending_document: e.target.value })
        }
    }
    handleLogout = () => {
        document.cookie = `did = ; expires= ${new Date()}`;
        window.location.href = "http://localhost:3000/";

    }
    handleDocSend = async() => {
        // handleDocSend will send the document to the vierifier
        // current component is for calling this.setstate inside the callback function

        //  we need to improve this section since we are duplicating the document on the ipfs
        // for different verifier since the document is same but the ipfs address is different
        // or we can leave as it is because if the same address is send then the address may be leak..
        
        // enable sending doc btn
        setTimeout(() => {
            this.setState({ sending_btn: true, send_status: false })
        }, 2000);
        const { accounts, VerifierSSI_contract } = this.state;
        let storage = JSON.parse(localStorage.getItem('documents'));
        let sending_document = this.state.sending_document;
        let sending_details = this.state.sending_details;
        let storage_details = storage[sending_document];
        // console.log(sending_details)
        // console.log(storage_details)
        //const ipfs = new IPFS()
        // let ipfsObj = storage[sending_document];
        let ipfsObj = {};
        ipfsObj.req_id = sending_details.request_id;
        ipfsObj.user_did = sending_details.u_did;
        ipfsObj.doc_did = storage_details.did;
        ipfsObj.title = storage_details.title;
        ipfsObj.image = storage_details.image;
        ipfsObj.name = storage_details.name;
        ipfsObj.email = storage_details.email;
        ipfsObj.phone = storage_details.phone;
        ipfsObj.review = storage_details.review;
        ipfsObj.status = storage_details.status;
        ipfsObj.issuer_did = storage_details.issuer_did;
        ipfsObj.signature = storage_details.signature;
        ipfsObj.created_at = storage_details.created_at;
        ipfsObj.verified_at = storage_details.verified_at;
        // once the node is ready
        console.log(ipfsObj)
        const ipfs = await IPFS.create({repo: 'ok' + Math.random()});
        const {cid} = await ipfs.add((JSON.stringify(ipfsObj)))
        console.log(cid)
        this.setState({ ipfsHash: cid });
        //node.once('ready', () => {
            // convert  data to a Buffer and add it to IPFS
            //node.add(IPFS.Buffer.from(JSON.stringify(ipfsObj)), async(err, files) => {
            //   if (err) return console.error(err)

                // 'hash', known as CID, is a string uniquely addressing the data
                // and can be used to get it again. 'files' is an array because
                // 'add' supports multiple additions, but we only added one entry
               // console.log(files[0].hash)
              //  console.log(this.state.sending_details.V_publicKey)
              //  this.setState({ ipfsHash: files[0].hash })
                // encrypt the ipfs address using public key of verifier
                // Encrypting the message for Verifier.
                // verifier public key

                // user is sending the message to the verifier 
                // reading Bob key pair from secret key
                const user_privateKey = Buffer.from(this.state.user.privateKey, "hex");
                // const user_publicKey = Buffer.from(this.state.user.publicKey, "hex");
                const verifier_publicKey = Buffer.from(sending_details.V_publicKey, "hex");
                // generating one time nonce for encryption
                const nonce = nacl.randomBytes(24)
                // message for Alice
                //let msg = files[0].hash;
                let msg = cid.toString();
                // Bob encrypts message for Alice
                const box = nacl.box(
                  nacl.util.decodeUTF8(msg),
                  nonce,
                  verifier_publicKey,
                  user_privateKey
                );
                // somehow send this message to Alice
                const message = { box, nonce } 
                console.log(message)
                let boxHex = arrayBufferToHex(message.box);
                let nonceHex = arrayBufferToHex(message.nonce);
                let messageHex = {boxHex,nonceHex,user_publicKey:this.state.user.publicKey};
                this.setState({ipfsMessage:messageHex});
                console.log(messageHex)
                



                await VerifierSSI_contract.methods
                  .acceptedByUser(
                    this.state.sending_details.request_id,
                    JSON.stringify(messageHex)
                  )
                  .send({ from: accounts[0] });
                // window.location.reload(false);


    } 
    componentDidMount = async () => {
        let cookie = document.cookie;
        let cookieArr = cookie.split('; ');
        let value = [];
        cookieArr.forEach(arr => {
            let content = arr.split('=');
            value[content[0]] = content[1];
            
        });

        this.setState({
            user: {
                name: value["name"],
                email: value["email"],
                phone: value["phone"],
                address: value["address"],
                did: value["did"],
                privateKey: value["privateKey"],
                publicKey: value["publicKey"],
            }
        });
        if(value['name']){
            let ran = value['name'].split(' ');
            this.setState({demo:ran[0]});
        }

        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork_SSI = SSI.networks[networkId];
            const instance_SSI = new web3.eth.Contract(
                SSI.abi,
                deployedNetwork_SSI && deployedNetwork_SSI.address,
                );
            const deployedNetwork_VerifierSSI = VerifierSSI.networks[networkId];
            const instance_VerifierSSI = new web3.eth.Contract(
                VerifierSSI.abi,
                deployedNetwork_VerifierSSI && deployedNetwork_VerifierSSI.address,
            );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({ web3, accounts, SSI_contract: instance_SSI,VerifierSSI_contract:instance_VerifierSSI });
            
            // latest Requests
            const VerifierSSI_contract = this.state.VerifierSSI_contract;
            // await VerifierSSI_contract.methods.evaluateRequest(this.state.user.did).send({ from: accounts[0] });
            let reqIndex = await VerifierSSI_contract.methods.showRequest(this.state.user.did).call();
            console.log(reqIndex)
            // if number is greater than 101020304050607080 (after this 09....) then it is 
            // converted to javascript and we could not handle this and gets error (by receiving the other document either not exist or of theres)
            let show = [];
            let request_details = [];
            if (reqIndex > 1) {
                // we have found documents
                while (reqIndex >= 100) {
                    let rem = reqIndex % 100;
                    show.push(rem);
                    reqIndex = Math.floor(reqIndex / 100);
                }
            }
            if (show){
                show.forEach( async id => {
                    // console.log(await VerifierSSI_contract.methods.getIndividualRequest(id).call());
                    request_details[0] = (await VerifierSSI_contract.methods.getIndividualRequest(id).call());
                    request_details[0].request_id = id;
                    let comp_and_doc = request_details[0].comp_and_doc;
                    request_details[0].docs = comp_and_doc.split(';')[0];
                    request_details[0].company = comp_and_doc.split(';')[1];
                    this.setState({requests:[...this.state.requests,request_details[0]]})
                });
                // console.log(request_details['request'])
            }

            // reading all the users documents from blockchian
            localStorage.removeItem('documents');
            let docArray = {}
            const SSI_contract = this.state.SSI_contract;
            // await SSI_contract.methods.evaluateRequest(this.state.user.did).send({ from: accounts[0] });
            let docsIndex = await SSI_contract.methods.showAllDocs(this.state.user.did).call();
            let allDocs = [];
            let docs = [];
            if (docsIndex > 1){
                // we have found documents
                while(docsIndex >= 100) {
                    let rem = docsIndex % 100;
                    allDocs.push(rem);
                    docsIndex = Math.floor(docsIndex / 100);
                }
            }
            if(allDocs) {
                const node = new IPFS()
                node.once('ready', () => {
                    allDocs.forEach( async id => {
                        docs[0] = (await SSI_contract.methods.getDocument(id).call());

                        // read the ipfs
                        node.cat(docs[0].ipfs, (err, data) => {
                            if (err) return console.error(err);
                            // convert Buffer back to string
                            // let storage = {};
                            // // console.log(JSON.parse(data));
                            // storage = JSON.parse(localStorage.getItem("documents"));
                            // if (!storage) {
                            //     storage = {};
                            // }
                            docArray[JSON.parse(data).title] = JSON.parse(data);

                            // console.log(JSON.parse(localStorage.getItem('ipfsDetails')))
                        });
                        docs[0].doc_id = id;
                        this.setState({ docs: [...this.state.docs, docs[0]] })
                    })
                });
                setTimeout(() => {
                    localStorage.setItem("documents", JSON.stringify(docArray));
                    this.setState({ loading: false })
                }, 1000);
            }
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }

    renderOptions = () => {
        let storage = JSON.parse(localStorage.getItem('documents'));
        if (storage && this.state.uploadDoc) {
            return Object.entries(storage).map((pair, i) => {
                return (
                    <option key={i} value={pair[0]}>
                        {pair[0]}
                    </option>
                )
            })
        }


    }
    renderDocuments = () => {
        console.log("YAHA SAMMA");
        let storage = JSON.parse(localStorage.getItem('documents'));
        if(storage && this.state.uploadDoc){
            return Object.entries(storage).map((pair,i) => {
                return (
                    <tr key={i}>
                        <td><h5>{pair[0]}</h5></td>
                        <td />
                        <td>
                            <button className={pair[1].status ? 'btn btn-success float-right' : 'btn btn-danger float-right'} >{} {(!pair[1].review) ? 'UNVERIFIED' : (pair[1].review && pair[1].status) ? 'Verified' : 'Rejected'}</button>
                            <button className="btn btn-secondary float-right mr-2" data-toggle="modal" data-target={"#exampleModal" + i}>PREVIEW</button>
                        <div className="modal fade" id={"exampleModal"+i} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog" role="document" style={{ maxWidth: '700px' }}>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">{pair[1].title}</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <img className="img-responsive" height="600px" width="400px" src={pair[1].image} alt=""/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </td>
                    </tr>
                )
            })
        }

    }
    render() {
        let cookie = document.cookie;
        let cookieArr = cookie.split('; ');
        let value = [];
        cookieArr.forEach(arr => {
            let content = arr.split('=');
            value[content[0]] = content[1];
        });
        if (!value['did']) {
            window.location.href = "http://localhost:3000/";
        }
        return (
                <div>
                <div className="dash-container">
                <div className="dash-nav">
                    <div>
                        <h1 className="dash-title">Contractor Home</h1>
                    </div>
                    <div>
                        <button onClick={this.handleLogout} className="dash-logout-btn">Logout</button>
                    </div>
                </div>
                    <div className="dash-profile-container">
                        <div className="profile-img"><div className="the-image" /></div>
                        <div className="">
                            <table className="table">
                                <tbody className="demo-user">
                                    <tr>
                                        <td><h5>Name:</h5></td>
                                        <td><p>{this.state.user.name}</p></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Address:</h5></td>
                                        <td><h6>{this.state.user.address}</h6></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Email:</h5></td>
                                        <td><h6 style={{textTransform:'lowercase'}}>{this.state.user.email}</h6></td>
                                    </tr>
                                    <tr>
                                        <td><h5>Phone:</h5></td>
                                        <td><h6>{this.state.user.phone}</h6></td>
                                    </tr>
                                    <tr>
                                        <td><h5>DID:</h5></td>
                                        <td><h6>{this.state.user.did}</h6></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {!this.state.send_status && 
                    <div className="dash-content-container">
                    <div className="content-table">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th><h1>Documents</h1></th>
                                    <th />
                                        <th><button className="dash-add-doc-btn float-right" data-toggle="modal" data-target="#exampleModal" onClick={this.handleFormPopUp}><i className="fa fa-plus" style={{ marginRight: '5px' }} />Add New</button></th>
                                </tr>
                            </thead>
                            <tbody>

                                { this.renderDocuments() }
                                                        
                            </tbody>
                        </table>
                        <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">Add New Document</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <form onSubmit={this.handleForm} encType="multipart/form-data">
                                        <label htmlFor="title">Document Title</label>
                                        <input type="text" name="title" onChange={this.handleTitle} className="form-control"/>
                                            <label htmlFor="document">Select Document File</label>
                                            <input type="file" name="file" onChange={this.handleFile} className="form-control"/>
                                        <div className="modal-footer">
                                                <button type="submit" onClick={this.handleForm} className="btn btn-primary" data-dismiss="modal">Add Document</button>
                                        </div>
                                            {this.state.image && <img src={this.state.image} alt=""/> }
                                    </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div className="share-credentials">
                            <div className="dispflex">
                                <div className="share-title"><h1>Recent Requests</h1></div>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th><h5>Company</h5></th>
                                        <th><h5>Requested Documents</h5></th>
                                        <th><h5>Requested At</h5></th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    <RenderRequests requests={this.state.requests} handleRemove={this.handleRemove} handleClickSend = {this.handleClickSend} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                    }
                    {
                        this.state.send_status && 
                        <div className="dash-main-request-container">
                            <div className="requeted-container">
                            <div onClick={this.handleCloseSend} class="open-close-button open" style={{marginTop:'10px'}}></div>
                            <div className="requested-content">
                            <p>Company: {this.state.sending_details.company}</p>
                            <p>Requested For: {this.state.sending_details.docs}</p>
                            <p>Requested At: <TimeAgo date={this.state.sending_details.req_at} /></p>
                            <p>Select Your Document to Send:</p>
                            <select className="dash-request-select" onChange={this.handleChangeSend} name="" id="">
                            <option value={0}>select</option>
                                {this.renderOptions()}
                            </select>
                                <button className={`dash-request-btn ${!this.state.sending_btn && 'form-btn-disabled'}`} onClick={this.handleDocSend}>Send Document</button>
                            </div>
                        </div>
                        </div>
                    }
                    </div>
                </div>

        )
    }
}

export default Dashboard;

