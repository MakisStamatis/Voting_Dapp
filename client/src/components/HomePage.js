import React from "react";
import getWeb3 from "../getWeb3";
import VoteContract from "../contracts/VoteContract.json";
import "../App.css";

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';

import { Spinner , Button , Container, Col , Row , Form} from 'react-bootstrap';

class HomePage extends React.Component {
//constructor of the class
  constructor(props){
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      isOwner: false,
      balance:null,
      abi:'',
      bytecode:'',
      elections_counter:null,
      elections_Names:[],
      election_name:null,
      error_msg:''
    }
  }

  componentDidMount = async () => {
    try {

      localStorage.clear();

      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VoteContract.networks[networkId];

      const instance = new web3.eth.Contract( VoteContract.abi, deployedNetwork && deployedNetwork.address,);

      //get balance of the account and then convert wei to ether
      const wei = await web3.eth.getBalance(accounts[0]);
      const balance = await web3.utils.fromWei(wei, 'ether');

      // Set web3, accounts,contract and balance to the state
      this.setState({web3: web3, account:accounts[0],VoteInstance: instance, balance:balance});
      this.setState({abi:VoteContract.abi, bytecode:VoteContract.bytecode});

      const counter = await this.state.VoteInstance.methods.getElectionsCounter().call();
      this.setState({elections_counter:counter});

      //populate the list with the elections names
      let Elections_nameList = [];
      for(let i=0;i<counter;i++){
        let name = await this.state.VoteInstance.methods.getElectionName(i).call();
        Elections_nameList.push(name);
      }

      this.setState({elections_Names:Elections_nameList});

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  
  newElection = async event => {
    let found = false;
    if(this.state.Election_name){
      for(let i=0;i<this.state.elections_counter;i++){
        if(this.state.elections_Names[i] === this.state.Election_name){
          this.setState({error_msg:"There is already an election with this name"});
          found = true;
          break;
        }
      }
      if(found === false){
        await this.state.VoteInstance.methods.createElection(this.state.Election_name).send({from : this.state.account , gas: 1000000});
        window.location.reload();
      }
    }
    else{
      this.setState({error_msg:"You must enter an election name"});
    }
  }

  updateElectionName = event => {
    this.setState({ Election_name : event.target.value ,error_msg:''});
  }
  /*
  let web3 = this.state.web3;

  const incrementer = new web3.eth.Contract(this.state.abi);

   const incrementerTx = incrementer.deploy({
      data: this.state.bytecode,
      arguments: [],
   }).send({
    from: this.state.account,
    gasPrice: '4612388 ',
    gas: '4612388 '
    }).then((instance) => {
    console.log("Contract mined at " + instance.options.address);
    });
    */

 //Used to make the current NavBar element active 
  componentDidUpdate(){
    if(document.getElementById('nav_home') !== null){
      document.getElementById('nav_home').classList.add("active");
    }
  }

  ChangeElection = async (event) =>{
    for(let i=0;i<this.state.elections_counter;i++){
      if(this.state.elections_Names[i] === event.target.value){
        // change global variable of election ID with i
        localStorage.setItem('ChoosenElectionID',i);
        localStorage.setItem('ChoosenElectionName',event.target.value);
      }
    }
    let election_owner = await this.state.VoteInstance.methods.getElectionOwner(localStorage.getItem('ChoosenElectionID')).call();
    if(election_owner === this.state.account){
      this.setState({isOwner:true});
    }else{
      this.setState({isOwner:false});
    }
  }

 

  render() {
    if (!this.state.web3) {
      return (
        <div className="App">
          {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>  
        </div>
        </div>
      );
    }
    return (
      <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="welcome_dapp">
          Welcome to Voting Dapp
        </div>
        <div className="Address">
          <p><span style={{fontWeight:"bold"}}>Your Wallet Address:</span> {this.state.account} </p>
          <p><span style={{fontWeight:"bold"}}>Your Balance:</span> {this.state.balance} Ether</p>
        </div>
        <Container>
          <Row>
          <Col md={{ span:4, offset:4}}>
          <div className="form-group">
            <label style={{fontWeight:"bold"}}>Elections List</label>
            <select defaultValue={'DEFAULT'} className="form-control elections_names" id="select_names" onChange={this.ChangeElection}>
              <option value="DEFAULT" disabled hidden>Please Select An Election</option>
              {this.state.elections_Names.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
              ))}
            </select>
          </div>
        </Col>
        </Row>
        </Container>
        <Container className="new_election_form">
          <Row>
            <Col md={{ span:4, offset:4}}>
              <Form>
                <Form.Group>
                  <Form.Label>Create New Election</Form.Label>
                  <Form.Control required type="text" placeholder="Enter Election Title" value = {this.state.name} onChange={this.updateElectionName}/>
                  <div className="error_msg">
                    {this.state.error_msg}
                  </div>
                  <Button variant="primary" onClick={this.newElection}>
                  Create
                </Button>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default HomePage;
