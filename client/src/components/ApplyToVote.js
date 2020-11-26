import React from "react";
import VoteContract from "../contracts/VoteContract.json";
import getWeb3 from "../getWeb3";

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';
import ElectionName from './ElectionName';

import {Button, Container,Row,Col,Form,Spinner } from 'react-bootstrap';

class ApplyToVote extends React.Component {
  //constructor of the class
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      name:'',
      uniqueID:'',
      candidates: null,
      voterCount: null,
      registered: false,
      isOwner:false,
      error_msg_name:'',
      error_msg_id:'',
      election_id:null
    }
  }

  updateName = event => {
    this.setState({ name : event.target.value , error_msg_name:''});
  }

  updateUniqueID = event => {
    this.setState({uniqueID : event.target.value , error_msg_id:''});
  }

  addVoter = async () => {
    let error = false;
    if(this.state.name && this.state.uniqueID){
        //check if given ID is already registered
        error = await this.state.VoteInstance.methods.voterExists(this.state.election_id,this.state.uniqueID).call();
      if(error === false){
        await this.state.VoteInstance.methods.applyToVote(this.state.name, this.state.uniqueID,this.state.election_id).send({from : this.state.account , gas: 1000000});
        window.location.reload();
      }else{
        this.setState({error_msg_id:"Your ID is already registered"});
      }
    }
    if(!this.state.name){
      this.setState({error_msg_name:"Please enter your name"});
    }
    if(!this.state.uniqueID){
      this.setState({error_msg_id:"You have to enter your ID"});
    }
  }

  componentDidMount = async () => {
    try {

      this.setState({election_id:localStorage.getItem('ChoosenElectionID')});
      //checking if user has selected an election from Home Page
      if(localStorage.getItem('ChoosenElectionID')){

        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = VoteContract.networks[networkId];
        const instance = new web3.eth.Contract( VoteContract.abi, deployedNetwork && deployedNetwork.address,);
        
        // Set web3, accounts, and contract to the state
        this.setState({web3: web3,account: accounts[0], VoteInstance: instance});

        //get number of voters
        let voterCount = await this.state.VoteInstance.methods.getVoterCount(this.state.election_id).call();
        this.setState({voterCount:voterCount});

        //check if the voter is already registered
        let registered;
        registered = await this.state.VoteInstance.methods.isVoterRegistered(this.state.account,this.state.election_id).call();
        this.setState({registered : registered});

        //get owner of the election
        const owner = await this.state.VoteInstance.methods.getElectionOwner(this.state.election_id).call();
        if(this.state.account === owner){
          this.setState({isOwner : true});
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

   //Used to make the current NavBar element active 
  componentDidUpdate(){
    if(document.getElementById('nav_apply_to_vote') !== null){
      document.getElementById('nav_apply_to_vote').classList.add("active");
    }
  }


  render() {

    if(this.state.election_id === null){
      return (
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
          <div className="under_nav">
            Please select an election from the home page
          </div>
        </div>
      );
    }

    if (!this.state.web3) {
      return (
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>  
        </div>
        <ElectionName/>
        </div>
      );
    }

    if(this.state.registered){
      return(
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          ALREADY REQUESTED TO REGISTER
        </div>
        <ElectionName/>
      </div>
      );
    }
   return (
    <div className="App">
        <div className="Candidates">
        </div>

        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          Voter Form
        </div>
        <Container>
      <Row>
        <Col md={{ span:4, offset:4}}>
    <Form>
      <Form.Group>
        <Form.Label>Full Name</Form.Label>
        <Form.Control required type="text" placeholder="Enter Your Name" value= {this.state.name} onChange={this.updateName}/>
        <div className="error_msg">
          {this.state.error_msg_name}
        </div>
      </Form.Group>
      <Form.Group>
        <Form.Label>Unique ID</Form.Label>
        <Form.Control required type="text" placeholder="Enter Your ID" value={this.state.uniqueID} onChange={this.updateUniqueID}/>
        <div className="error_msg">
          {this.state.error_msg_id}
        </div>
      </Form.Group>
      <Button variant="primary"  onClick={this.addVoter}>
        Submit
      </Button>
    </Form>
    </Col>
    </Row>
    </Container>



    <ElectionName/>
    </div>
    );
  }
}

export default ApplyToVote;