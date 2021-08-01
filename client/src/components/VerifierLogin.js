import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
//import uuid from 'uuid'
import { v1 as uuid } from 'uuid'; 
// import {Cookies} from 'react-cookie';
import eccrypto from 'eccrypto';
import CryptoJS from "crypto-js";

const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const arrayBufferToHex = require("array-buffer-to-hex");


class VerifierLogin extends Component {
    state = {
        name:'',
        v_email:'government123',
         v_phone:'12345',
        // address:'',
        // privateKey:null,
        // publicKey:null,
        loading:true,
        sign_loading:true,
        // download:false,
        error:false,
        errorMsg:null,
        success:false,
        successMsg:null,
        // showDownloadSuccess:false,
        // signature:false,
        // signatureValue:null,
        route:false,
        v_did:"6G237080B7F911E9BCCD03A2106A727R",
    }

    handleChange = (e) => {
        this.setState({[e.target.name]:e.target.value});
    }

    

    renderError = (errorMsg) => {
      this.setState({error:true, errorMsg});
      setTimeout(() => {
        this.setState({error:false})
      }, 5000);
    }

    handleSubmit = (e) => {
        e.preventDefault();
      const profile_uuid = uuid().replace(/-/g, "").toUpperCase();
      this.setState({v_did:'6G237080B7F911E9BCCD03A2106A727R'});
      // if (
      //   this.state.name &&
      //   this.state.phone &&
      //   this.state.email &&
      //   this.state.address &&
      //   this.state.signature
      // ) {
       
        if(this.state.v_email==="government123" && this.state.v_phone==="12345"){
        
          
          document.cookie = `email = ${this.state.v_email}`;
          document.cookie = `phone = ${this.state.v_phone}`;
          document.cookie = `v_did = ${this.state.v_did}`;
          // document.cookie = `address = ${this.state.address}`;
          // document.cookie = `did = ${profile_uuid}`;
          // document.cookie = `privateKey = ${this.state.privateKey}`;
          // document.cookie = `publicKey = ${this.state.publicKey}`;
          window.location.href = "http://localhost:3000/verifier";
        }
      
        
        else{
          console.log("error")
          this.renderError('Unable to log in. Please check your credentials.');
        }
      }
      
    
  
      

      //     this.setState({ route: true });
      //   } else {
      //     this.setState({
      //       error: true,
      //       errorMsg: "Please Download the Credentials Details First"
      //     });
      //     setTimeout(() => {
      //       this.setState({ error: false });
      //     }, 5000);
      //   }
      // } else if (
      //   this.state.name &&
      //   this.state.phone &&
      //   this.state.email &&
      //   this.state.address
      // ) {
      //   // generate a signature
      //   const signatureObject = {
      //     name: this.state.name,
      //     phone: this.state.phone,
      //     email: this.state.email,
      //     address: this.state.address,
      //     did: profile_uuid,
      //   };
      //   // encrypting the message
      //   // Encrypt
      //   var ciphertext = CryptoJS.AES.encrypt(
      //     JSON.stringify(signatureObject),
      //     this.state.privateKey
      //   );
      //   this.setState({signature:true, signatureValue: ciphertext.toString() })
      //   this.setState({
      //     success: true,
      //     successMsg: "Signature generated, Please download the credential."
      //   });
      //   setTimeout(() => {
      //     this.setState({ success: false, sign_loading:false });
      //   }, 3000);

      // } else if (!this.state.signature) {
      //   this.setState({
      //     error: true,
      //     errorMsg: "Please complete the form fields to generate a signature"
      //   });
      //   setTimeout(() => {
      //     this.setState({ error: false });
      //   }, 5000);
      // } else if (!this.state.download) {
      //   this.setState({
      //     error: true,
      //     errorMsg: "Please Download the Credentials Details First"
      //   });
      //   setTimeout(() => {
      //     this.setState({ error: false });
      //   }, 5000);
      // }  else {
      //   this.setState({
      //     error: true,
      //     errorMsg: "All Fields are Required!!"
      //   });
      //   setTimeout(() => {
      //     this.setState({ error: false });
      //   }, 4000);
      // }

    // }
    componentDidMount = () => {
      // Generating Cryptographic credentials
      // A new random 32-byte private key.
      let privateKey = eccrypto.generatePrivate();
      // privateKey to Hex (private key is generated from eccrypto and can easily convereted to hex)
      let privateHex = privateKey.toString('hex')

      // converting back private key hex to uintarray
      // console.log(Buffer.from(arrayBufferToHex(privateKey),"hex"));

      // Corresponding uncompressed (65-byte) public key.
      // we are generating public key from the nacl(Salt) and to convert it to hex we have used another library 
      let publicKey = nacl.box.keyPair.fromSecretKey(privateKey).publicKey;
      // generating public key hex
      let publicHex = arrayBufferToHex(publicKey);
      console.log(publicHex)

      this.setState({publicKey:publicHex,privateKey:privateHex})
      

    };

    handleLoading = () => {
      setTimeout(() => {
        this.setState({loading:false})
      }, 3000);
    }

    // handleDownload = (e) => {
    //   e.preventDefault();
    //   let file_name = 'cryptographic_details.txt';
    //   let details = `Private Key: ${this.state.privateKey}\nPublic Key: ${this.state.publicKey}\nSignature: ${this.state.signatureValue}`;
    //   var element = document.createElement('a');
    //   element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(details));
    //   element.setAttribute('download', file_name);
    //   element.style.display = 'none';
    //   document.body.appendChild(element);
    //   element.click();
    //   document.body.removeChild(element);
    //   this.setState({signature:true, download: true, showDownloadSuccess:true})
    //   setTimeout(() => {
    //     this.setState({ showDownloadSuccess: false })
    //   }, 5000)
    // }
    
    render() {
      if (this.state.route === true) {
        return <Redirect to='/verifier' />
      }
      if(this.state.name && this.state.phone){
        this.handleLoading();
      }
        return (
          <div style={{display:'flex', justifyContent:'space-around'}}>
            <div className="create-account-tab">
              <div onClick={this.props.handleCreateCut} className="open-close-button open"></div>
              <form
                action="#"
                onSubmit={this.handleSubmit}
                className="create-account-form"
                autoComplete="off"
              >
                <h1 className="login-title">login</h1>
                {this.state.error && (
                  <div
                    className="alert alert-danger"
                    style={{ textTransform: "none" }}
                  >
                    {this.state.errorMsg}
                  </div>
                )}
                {this.state.success && (
                  <div
                    className="alert alert-success"
                    style={{ textTransform: "none" }}
                  >
                    {this.state.successMsg}
                  </div>
                )}
                <div className="create-account-block create-username">
                  <label htmlFor="create-account-username">
                    email: {this.state.name}
                  </label>
                  <input
                    type="text"
                    name="v_email"
                    className="signup_input form-control"
                    onChange={this.handleChange}
                    placeholder="email"
                    id="create-account-username"
                  />
                </div>
                <small className="small-create-wallet small-username">
                  *required field
                </small>
                <div className="create-account-block create-password">
                  <label htmlFor="create-account-password">password:</label>
                  <input
                    type="password"
                    name="v_phone"
                    className="signup_input form-control"
                    onChange={this.handleChange}
                    placeholder="password"
                    id="create-account-password"
                  />
                </div>
                <small className="small-create-wallet small-phoneNo">
                  *required field
                </small>
                
                

                <div className="submit-btn">
                  <button className="form-submit">log in</button>
                </div>
              </form>
            </div>
           
          </div>
        );
    }
}

export default VerifierLogin;

