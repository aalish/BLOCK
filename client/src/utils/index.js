import getWeb3 from "./getWeb3";



export async function signAndSendTransaction(options, privateKey) {
    console.log(privateKey)
    const web3 = await getWeb3();
    let signedTransaction = await web3.eth.accounts.signTransaction(
        options,
        privateKey
    );
    console.log(signedTransaction);
    await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
}
