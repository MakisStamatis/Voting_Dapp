import React from "react";
import VoteContract from "../contracts/VoteContract.json";
import getWeb3 from "../getWeb3";

import { Button , Container , Row , Col,Spinner} from 'react-bootstrap';

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';
import ElectionName from './ElectionName';

import '../index.css';

class VerifyVoter extends React.Component {
  //constructor of the class
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      votersList: null,
      isOwner:false,
      election_id:null
    }
  }

  verifyVoter = async event => {
    await this.state.VoteInstance.methods.verifyVoter(event.target.value,this.state.election_id).send({from : this.state.account , gas: 1000000});
    window.location.reload();
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
        const instance = new web3.eth.Contract( VoteContract.abi,deployedNetwork && deployedNetwork.address,);

        // Set web3, accounts, and contract to the state
        this.setState({web3: web3,account: accounts[0], VoteInstance: instance});


        //populate the voters List
        let votersList = [];
        votersList = await this.state.VoteInstance.methods.getVoters(this.state.election_id).call();
        this.setState({votersList : votersList});

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
    if(document.getElementById("admin_span") !== null){
      document.getElementById('admin_span').classList.add("text-white");
    }
  }

  render() {
    let votersList;
    if(this.state.votersList){
        votersList = this.state.votersList.map((voter) => {
        return (
          <Container key={voter}>
            <Row>
              <Col md={{ span:8, offset:2}}>
          <div className="candidate">
            <div className="candidateName">{voter.name}</div>
              <div>UniqueID : {voter.uniqueID}</div>
              <div>Voter Address : {voter.voterAddress}</div>
            {voter.isVerified ? <Button disabled variant="green">Verified</Button> : <Button onClick={this.verifyVoter} value={voter.voterAddress} variant="blue">Verify</Button>}
          </div>
          </Col>
          </Row>
          </Container>
        );
      });
    }
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

    if(!this.state.isOwner){
      return(
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
          <div className="under_nav">
            NEED ADMIN ACCESS
          </div>
          <ElectionName/>
          </div>
      );
    }

    if(this.state.votersList && this.state.votersList.length <= 0){
      return(

        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
          <div className="under_nav">
            Noone has applied to vote yet.
          </div>
          <ElectionName/>
          </div>

      );
    }

    return (
      <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          Verify Voters
        </div>

        <div>
          {votersList}
        </div>

        <ElectionName/>
      </div>
    );
  }
}

export default VerifyVoter;