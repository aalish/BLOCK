import React from 'react';
import './App.css';
import SignUp from './components/SignUp';
import VerifierLogin from './components/VerifierLogin';

import {Redirect} from 'react-router-dom'
import CryptoJS from "crypto-js";

const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const arrayBufferToHex = require("array-buffer-to-hex");

class App extends React.Component {
  state = {
    showBackground: false,
    showLogin: false,
    handleVerifier: false,
    showVerifierLogin:false,
    showCreateWallet: false,
    showVerifyLogin: false,
    showVerify: false,
    showTitleAndButtons: true,
    signature: "",
    privateKey: "",
    route:false,
    loadingCredential:false,
    error:false,
    errorMsg:null,
    success:false,
    successMsg:null,
  };

  renderError = (errorMsg) => {
    this.setState({error:true, errorMsg});
    setTimeout(() => {
      this.setState({error:false})
    }, 5000);
  }
  showLogin = () => {
    this.setState({ showTitleAndButtons:false, showBackground: true, showLogin: true });
  };
  handleVerifier = () => {
    this.setState({ showTitleAndButtons:false, showBackground: true, showVerifierLogin: true });
  };
  handleCreateWallet = () => {
    this.setState({
      showBackground: true,
      showCreateWallet: true,
      showTitleAndButtons: false
    });
  };
  handleLoginCut = () => {
    this.setState({ showTitleAndButtons:true, showBackground: false, showLogin: false });
  };
  handleCreateCut = () => {
    this.setState({
      showBackground: false,
      showCreateWallet: false,
      showTitleAndButtons: true
    });
  };
  handleVerify = () => {
    this.setState({
      showBackground: false,
      showVerify: true,
      showCreateWallet: false
    });
  };
  handleVerifyCreateCut = () => {
    this.setState({
      showBackground: false,
      showVerifierLogin: false,
      showTitleAndButtons: true
    });
  };
  handleVerifyLogin = () => {
    this.setState({
      showBackground: false,
      showVerify: true,
      showVerifierLogin: false
    });
  };
  handleLoginChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };


  handleFile = (e) => {
    let fileName = e.target.files[0].name;

    let fileExt = fileName.split('.').pop();
    if(fileExt === 'txt') {
      let privateKey = null;
      let signature = null;
      // correct file extension
      try {
        const reader = new FileReader();
        reader.onload = function fileReadCompleted() {
          // when the reader is done, the content is in reader.result.
          let result = reader.result;
          result = result.split('\n');
          privateKey = result[0].split(': ').pop()
          signature = result[2].split(': ').pop()
        };
        reader.readAsText(e.target.files[0]);
        this.setState({ loadingCredential:true})
        setTimeout(() => {
          this.setState({ privateKey, signature, loadingCredential:false})
        }, 2000);
      } catch (err) {
        this.renderError('The selected file is corrupted.');
      }

    } else{
      // wrong file
      this.renderError('Please select correct file');
    }
  }
  handleLogin = (e) => {
    e.preventDefault();

    if(this.state.signature && this.state.privateKey){
      // start the login process

      try {
        var bytes = CryptoJS.AES.decrypt(
          this.state.signature,
          this.state.privateKey
        );
        console.log(bytes)
        var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        console.log(data);
        // console.log(Buffer.from(this.state.privateKey, "hex"));
        // extracting the public key from private key
        let publicKey = nacl.box.keyPair.fromSecretKey(
          Buffer.from(this.state.privateKey, "hex")
        ).publicKey;
        let publicHex = arrayBufferToHex(publicKey);

        // setting cookies

        document.cookie = `name = ${data.name}`;
        document.cookie = `phone = ${data.phone}`;
        document.cookie = `email = ${data.email}`;
        document.cookie = `address = ${data.address}`;
        document.cookie = `did = ${data.did}`;
        document.cookie = `privateKey = ${this.state.privateKey}`;
        document.cookie = `publicKey = ${publicHex}`;

        window.location.href = "http://localhost:3000/dashboard";
        
      } catch(error) {
        console.log(error)
        this.renderError('Unable to log in. Please check your credentials.');
      }


    }
  };
  componentDidMount() {


    let cookie = document.cookie;
    // console.log(cookie)
    let value = [];
    value["did"] = null;
    if (cookie) {
      let cookieArr = cookie.split("; ");

      cookieArr.forEach(arr => {
        let content = arr.split("=");
        value[content[0]] = content[1];
        // value.push(content[1]);
      });
    }

    if(value['did']){
      this.setState({route:true})
    }
  }
  render() {

      if (this.state.route === true) {
        return <Redirect to='/dashboard' />
      }
    return (
      <div className="App">
        {this.state.showTitleAndButtons && (
          <div>
            <div className="homePageHeader">OPEN LEDGER SYSTEM</div>
            <div className="btn-container">
              <div className="animated fadeIn login_btn">
                <div className="main_btn" onClick={this.showLogin}>Log In</div>
              </div>
              <div className="animated fadeIn wallet_btn">
                <div className="main_btn" onClick={this.handleCreateWallet}>Wallet Signup</div>
              </div>
            </div>
            <div class = "navbar">
            <div className="main_btn" onClick={this.handleVerifier}>Verifier Log In</div>
            </div>
          </div>
        )}

        <div>
          {this.state.showLogin && (
            <div>

            <span className="login-alerts">
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
            </span>
            <div className="log-in-tab">
              <div onClick={this.handleLoginCut} className="open-close-button open"></div>
              <form action="#" className="log-in-form" autoComplete="off">
              <h1 className="login-title">Member Area</h1>
                <div className="form-block username-block">
                  <label htmlFor="Signature">Signature</label>
                  <input
                    onChange={this.handleLoginChange}
                    className="signup_input"
                    id="username"
                    type="text"
                    placeholder="Signature"
                    name="signature"
                    value={this.state.signature}
                  />
                </div>
                <div className="form-block password-block">
                  <label htmlFor="Private Key">Private Key</label>
                  <input
                    onChange={this.handleLoginChange}
                    className="signup_input"
                    id="password"
                    type="password"
                    placeholder="private key"
                    name="privateKey"
                    value={this.state.privateKey}
                  />
                </div>
                {this.state.loadingCredential ? (
                  <div className="text-center">
                    <div className="lds-facebook">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p className="">loading credentials...</p>
                  </div>
                )
                
                :                
                <div className="form-block password-block" style={{position:'relative'}}>
                    <label className="app-or" htmlFor="OR"><div className="app-line-left"></div>OR<div className="app-line-right"></div></label>
                  <input
                    onChange={this.handleFile}
                    className="signup_input"
                    id="file"
                    type="file"
                    name="file"
                    style={{display:'none'}}
                    accept=".txt"
                  />
                  <label className="app-upload-btn" htmlFor="file">Upload credential file</label>
                </div>
                }
                <div className="submit-btn">
                  <button onClick={this.handleLogin} className="form-submit">
                    log in
                  </button>
                </div>
              </form>
            </div>
            </div>
          )}


          {this.state.showCreateWallet && (
            <SignUp
              handleCreateCut={this.handleCreateCut}
              handleVerify={this.handleVerify}
            />
          )}
           {this.state.showVerifierLogin && (
            <VerifierLogin
              handleCreateCut={this.handleVerifyCreateCut}
              handleVerify={this.handleVerifyLogin}
            />
          )}
          {this.state.showBackground && <div className="background" />}
        </div>
      </div>
    );
  }
}

export default App;
