import React, { Component } from 'react'
import './issuer.css';
import IPFS from 'ipfs-core'
import SSI from "../contracts/SSI.json";
import getWeb3 from "../utils/getWeb3";

class Issuer extends Component {
    state = {
        web3: null,
        accounts: null,
        contract: null,
        refresh:false,
        documents:[],
        totalDocument:0,
        loading:true,
    }
 
    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            // console.log(accounts);

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = SSI.networks[networkId];
            const instance = new web3.eth.Contract(
                SSI.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            this.setState({ web3, accounts, contract: instance });

            const SSI_contract = this.state.contract;
            let totalDocument = await SSI_contract.methods.totalDocuments().call();
            console.log(totalDocument)
            this.setState({totalDocument});
            this.loadDocument();
            setTimeout(() => {
                this.setState({loading:false})
            }, 1000);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }
    // handleApprove = async(pair,i) => {
    //     console.log(i)
    //     const { accounts, contract } = this.state;

    //     let storage = JSON.parse(localStorage.getItem('documents'));
    //     pair[1].review = true;
    //     pair[1].status = 1;
    //     storage[pair[0]] = pair[1];
    //     localStorage.setItem('documents', JSON.stringify(storage));
    //     storage = JSON.parse(localStorage.getItem('documents'));
    //     console.log(storage)

    //     await contract.methods.verifyDocument(pair[1].doc_id, pair[1].user_did, pair[1].did, pair[1].ipfs,'adsfasdfdsf').send({ from: accounts[0] });
    //     const docDetails = await contract.methods.getDocument(pair[1].doc_id).call();
    //     console.log(docDetails)
    //     this.setState({refresh:true})

    // }

    handleApprove = async (pair, i) => {
        console.log(i)
        const { accounts, contract } = this.state;
        console.log('pair')
        console.log(pair)
        pair.review = true;
        pair.status = 1;
        // create an IPFS
        const node = new IPFS();
        node.once("ready", () => {
            // convert  data to a Buffer and add it to IPFS
            node.add(
                IPFS.Buffer.from(JSON.stringify(pair)),
                async (err, files) => {
                    if (err) return console.error(err);

                    // write document did to the blockchain

                    await contract.methods.verifyDocument(pair.doc_id, pair.user_did, pair.did, files[0].hash, 'adsfasdfdsf').send({ from: accounts[0] });
                });
        });
        const docDetails = await contract.methods.getDocument(pair.doc_id).call();
        console.log(docDetails)
        this.setState({ refresh: true })

    }
 
    handleReject = async (pair, i) => {
        console.log(i)
        const { accounts, contract } = this.state;

        pair.review = true;
        pair.status = 0;
        // create an IPFS
        const node = new IPFS();
        node.once("ready", () => {
            // convert  data to a Buffer and add it to IPFS
            node.add(
                IPFS.Buffer.from(JSON.stringify(pair)),
                async (err, files) => {
                    if (err) return console.error(err);

                    // write document did to the blockchain

                    await contract.methods.verifyDocument(pair.doc_id, pair.user_did, pair.did, files[0].hash, 'adsfasdfdsf').send({ from: accounts[0] });
                });
        });

        const docDetails = await contract.methods.getDocument(pair.doc_id).call();
        console.log(docDetails)
        this.setState({ refresh: true })

    }
    loadDocument = async () => {
        let SSI_contract = this.state.contract;
        let doc = [];
        for (let index = 0; index < this.state.totalDocument; index++) {
            let d = await SSI_contract.methods.getDocument(index).call();
            console.log(d)
            if(d.ipfs){
                const node = new IPFS()
                node.once('ready', () => {
                    node.cat(d.ipfs, (err, data) => {
                        if (err) return console.error(err);
                        // convert Buffer back to string
                        // console.log(JSON.parse(data));
                        doc.push(JSON.parse(data));
                    });
                })
            }
        }
        
        this.setState({documents:doc, refresh:true});
    }
    renderDocuments = () => {
        // read all the documents from the blockchain

        if (this.state.documents.length) {
            return this.state.documents.map((pair, i) => {
                console.log('testsetes')
                return (
                    <tr key={i}>
                        <td><h6>{pair.user_did}</h6></td>
                        <td><h6>{pair.title}</h6></td>
                        <td><h6>{pair.created_at}</h6></td>
                        <td>
                            { !pair.review && <span>
                                <button onClick={() => this.handleReject(pair, i)} className="btn btn-danger float-right ml-2">reject</button>
                                <button onClick={() => this.handleApprove(pair,i)} className="btn btn-success float-right ml-2">approve</button> </span>
                            }
                            {pair.review && <span>
                                {(pair.review && pair.status) ? <button className="btn btn-success float-right ml-2">approved</button>
                                : <button  className="btn btn-danger float-right ml-2">rejected</button>} </span>
                            }
                            <button className="issuer-search-btn float-right" style={{paddingLeft:'30px',paddingRight:'30px',paddingtop:'13px'}} data-toggle="modal" data-target={"#exampleModal" + i}>preview</button>
                        </td>
                        <div className="modal fade" id={"exampleModal" + i} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog" role="document" style={{maxWidth:'800px'}}>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">{pair.title}</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Document No: {pair.doc_id}</p>
                                        <p>Name: {pair.name}</p>
                                        <p>Phone: {pair.phone}</p>
                                        <p>Email: {pair.email}</p>
                                        <p>Address: {pair.address}</p>
                                        <p>DID: {pair.did}</p>
                                        <p>Status: {(pair.review) ? 'Reviewed' : 'Not Reviewed'}</p>

                                        <img className="img-responsive" height="600px" width="400px" src={pair.image} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </tr>
                )
            })
        }

    }
    render() {
        // if (this.state.refresh === true) {
        //     this.setState({ refresh: false })
        //     return <Redirect to='/issuer' />
        // }
        return (
            <div className="issuer-container">
                <div className="dash-nav">
                    <div>
                        <h1 className="dash-title">Self Sovereign Identity</h1>
                    </div>
                    <div>
                        <input className="search-issuer" type="text" placeholder="search" />
                        <button onClick={this.handleLogout} className="issuer-search-btn">Search</button>
                    </div>
                </div>
                <div>
                    <div className="main-header">
                        <div className="issuer">
                            <div className="issuer_logo" />
                            <div className="issuer_title"><h1 style={{ fontSize: '3rem' }}>Issuer</h1></div>
                        </div>

                    </div>
                    <div className="requests-list">
                        <div className="container">
                            <h2 style={{ marginTop: '4vh', marginBottom: '4vh',color:'#691008',fontWeight:500 }}>Requests list</h2>
                            <table className="table">
                                <thead className="issuer-thead">
                                    <tr>
                                        <th><h5>Account</h5></th>
                                        <th><h5>Document</h5></th>
                                        <th><h5>Timestamp</h5></th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {!this.state.loading && this.renderDocuments()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
 
            </div>
        )
    }
}

export default Issuer;