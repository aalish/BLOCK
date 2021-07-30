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


class SignUp extends Component {
    state = {
        name:'',
        email:'',
        phone:'',
        address:'',
        privateKey:null,
        publicKey:null,
        loading:true,
        sign_loading:true,
        download:false,
        error:false,
        errorMsg:null,
        success:false,
        successMsg:null,
        showDownloadSuccess:false,
        signature:false,
        signatureValue:null,
        route:false,
    }

    handleChange = (e) => {
        this.setState({[e.target.name]:e.target.value});
    }

    handleSubmit = (e) => {
        e.preventDefault();
      const profile_uuid = uuid.replace(/-/g, "").toUpperCase();
      this.setState({did:profile_uuid});
      if (
        this.state.name &&
        this.state.phone &&
        this.state.email &&
        this.state.address &&
        this.state.signature
      ) {
        if(this.state.download){

          document.cookie = `name = ${this.state.name}`;
          document.cookie = `phone = ${this.state.phone}`;
          document.cookie = `email = ${this.state.email}`;
          document.cookie = `address = ${this.state.address}`;
          document.cookie = `did = ${profile_uuid}`;
          document.cookie = `privateKey = ${this.state.privateKey}`;
          document.cookie = `publicKey = ${this.state.publicKey}`;
  
          this.setState({ route: true });
        } else {
          this.setState({
            error: true,
            errorMsg: "Please Download the Credentials Details First"
          });
          setTimeout(() => {
            this.setState({ error: false });
          }, 5000);
        }
      } else if (
        this.state.name &&
        this.state.phone &&
        this.state.email &&
        this.state.address
      ) {
        // generate a signature
        const signatureObject = {
          name: this.state.name,
          phone: this.state.phone,
          email: this.state.email,
          address: this.state.address,
          did: profile_uuid,
        };
        // encrypting the message
        // Encrypt
        var ciphertext = CryptoJS.AES.encrypt(
          JSON.stringify(signatureObject),
          this.state.privateKey
        );
        this.setState({signature:true, signatureValue: ciphertext.toString() })
        this.setState({
          success: true,
          successMsg: "Signature generated, Please download the credential."
        });
        setTimeout(() => {
          this.setState({ success: false, sign_loading:false });
        }, 3000);

      } else if (!this.state.signature) {
        this.setState({
          error: true,
          errorMsg: "Please complete the form fields to generate a signature"
        });
        setTimeout(() => {
          this.setState({ error: false });
        }, 5000);
      } else if (!this.state.download) {
        this.setState({
          error: true,
          errorMsg: "Please Download the Credentials Details First"
        });
        setTimeout(() => {
          this.setState({ error: false });
        }, 5000);
      }  else {
        this.setState({
          error: true,
          errorMsg: "All Fields are Required!!"
        });
        setTimeout(() => {
          this.setState({ error: false });
        }, 4000);
      }

    }
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

    handleDownload = (e) => {
      e.preventDefault();
      let file_name = 'cryptographic_details.txt';
      let details = `Private Key: ${this.state.privateKey}\nPublic Key: ${this.state.publicKey}\nSignature: ${this.state.signatureValue}`;
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(details));
      element.setAttribute('download', file_name);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      this.setState({signature:true, download: true, showDownloadSuccess:true})
      setTimeout(() => {
        this.setState({ showDownloadSuccess: false })
      }, 5000)
    }
    
    render() {
      if (this.state.route === true) {
        return <Redirect to='/dashboard' />
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
                <h1 className="login-title">Register</h1>
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
                    Full Name: {this.state.name}
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="signup_input form-control"
                    onChange={this.handleChange}
                    placeholder="username"
                    id="create-account-username"
                  />
                </div>
                <small className="small-create-wallet small-username">
                  *required field
                </small>
                <div className="create-account-block create-password">
                  <label htmlFor="create-account-password">phone no:</label>
                  <input
                    type="text"
                    name="phone"
                    className="signup_input form-control"
                    onChange={this.handleChange}
                    placeholder="phone no"
                    id="create-account-password"
                  />
                </div>
                <small className="small-create-wallet small-phoneNo">
                  *required field
                </small>
                <div className="create-account-block confirm-password-block">
                  <label htmlFor="create-account-confirm-password">
                    email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="signup_input form-control"
                    onChange={this.handleChange}
                    placeholder="email"
                    id="create-account-confirm-password"
                  />
                </div>
                <small className="small-create-wallet small-email">
                  *required field
                </small>

                <div className="create-account-block confirm-password-block">
                  <label htmlFor="create-account-confirm-password">
                    address
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="signup_input form-control"
                    onChange={this.handleChange}
                    placeholder="address"
                  />
                </div>
                <small className="small-create-wallet small-email">
                  *required field
                </small>

                <div className="submit-btn">
                  <button className="form-submit">sign up</button>
                </div>
              </form>
            </div>
            {this.state.name && this.state.phone && (
              <div className="create-crypto-tab">
                <form
                  onSubmit={this.handleDownload}
                  className="create-account-form"
                  autoComplete="off"
                >
                  <div className="alert alert-info">
                    <h4 className="text-center">
                      Keep Cryptographic Details Secrectly
                    </h4>
                  </div>
                  {this.state.showDownloadSuccess && (
                    <div
                      className="alert alert-success"
                      style={{ textTransform: "none" }}
                    >
                      Thanks for downloading...
                    </div>
                  )}
                  <br />
                  {this.state.loading ? (
                    <div className="text-center">
                      <div className="lds-facebook">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <p className="">Generating Cryptographic Details...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="create-account-block create-username">
                        <label htmlFor="create-account-username">
                          Public Key:
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="signup_input form-control"
                          value={this.state.publicKey}
                        />
                      </div>
                      <small className="small-create-wallet small-username">
                        *required field
                      </small>
                      <div className="create-account-block create-password">
                        <label htmlFor="create-account-password">
                          Private Key:
                        </label>
                        <input
                          type="text"
                          name="phone"
                          className="signup_input form-control"
                          value={this.state.privateKey}
                        />
                      </div>
                      <small className="small-create-wallet small-phoneNo">
                        *required field
                      </small>

                      {this.state.signature && (
                            this.state.sign_loading ? (
                              <div className="text-center">
                                <div className="lds-facebook">
                                  <div></div>
                                  <div></div>
                                  <div></div>
                                </div>
                                <p className="">Generating signature...</p>
                              </div>
                            ) : 
                          <div className="create-account-block create-password">
                            <label htmlFor="create-account-password">
                              Signature:
                            </label>
                            <input
                              type="text"
                              name="phone"
                              className="signup_input form-control"
                              value={this.state.signatureValue}
                            />
                          </div>
                        )}
                      <div className="create-account-submit text-center">
                        <button className={`form-submit  ${!this.state.signature && 'form-btn-disabled'}` } disabled={!this.state.signature}>
                          Save Credentials
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        );
    }
}

export default SignUp;

