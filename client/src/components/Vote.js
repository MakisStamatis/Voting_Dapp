import React from "react";
import VoteContract from "../contracts/VoteContract.json";
import getWeb3 from "../getWeb3";

import {Form,Button ,Container,Col, Row,Spinner} from 'react-bootstrap';

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';
import ElectionName from './ElectionName';

class Vote extends React.Component {
  //constructor of the class
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      candidateList: null,
      candidateId:'',
      candidateCount:null,
      //myAccount:null,
      start:false,
      end:false,
      isOwner:false,
      error_msg:'',
      contract_address:'',
      election_id:null,
      isVerified:null,
      hasVoted:null
    }
  }

  


  updateCandidateId = event => {
    this.setState({candidateId : event.target.value , error_msg:''});
  }

  vote = async () => {

    let found = false;
    if(this.state.candidateId){ 
      //check if the any of the candidates has the specified ID 
      for(let i=0; i<this.state.candidateCount;i++){
        if(this.state.candidateList[i].candidateId === this.state.candidateId){
          await this.state.VoteInstance.methods.vote(this.state.candidateId,this.state.election_id).send({from : this.state.account , gas: 1000000});
          this.setState({error_msg:''});
          found = true;
          window.location.reload(false);
          break;
        }
      }
      if(found===false){
        this.setState({error_msg:"No Candidate has this ID"});
      }
    }else{
      this.setState({error_msg:"Please enter a candidate's ID"});
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
        this.setState({contract_address:deployedNetwork.address});
        // Set web3, accounts, and contract to the state
        this.setState({web3: web3,account: accounts[0], VoteInstance: instance});


        let {isVerified,hasVoted} = await this.state.VoteInstance.methods.getVotingDetails(this.state.account,this.state.election_id).call();
        this.setState({isVerified:isVerified,hasVoted:hasVoted});

        //get number of candidates
        let candidateCount = await this.state.VoteInstance.methods.getCandidateNumber(this.state.election_id).call();
        this.setState({candidateCount: candidateCount});

        //populate the candidate list
        let candidateList = [];
        candidateList = await this.state.VoteInstance.methods.getCandidates(this.state.election_id).call();
        this.setState({candidateList : candidateList});

        //get status of the election (if it has started or has ended)
        let start = await this.state.VoteInstance.methods.getStart(this.state.election_id).call();
        let end = await this.state.VoteInstance.methods.getEnd(this.state.election_id).call();

        this.setState({start : start, end : end });

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
    if(document.getElementById('nav_vote') !== null){
      document.getElementById('nav_vote').classList.add("active");
    }
  }

  render() {
    let candidateList;
    if(this.state.candidateList){
      candidateList = this.state.candidateList.map((candidate) => {
        return (
          <Container key={candidate}>
          <Row>
          <Col md={{ span:4, offset:4}}>
          <div className="candidate">
          <div className="candidateName">{candidate.name}</div>
            <div className="candidateID">Candidate ID : {candidate.candidateId}</div>
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

    if(this.state.end){
      return(
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          Voting Process has ended
        </div>
        <ElectionName/>
        </div>
      );
    }

    if(!this.state.start){
      return(
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          Voting Process has not started yet.
        </div>
        <div className="under_nav">
          Please wait for the election to start !
        </div>
        <ElectionName/>
        </div>
      );
    }

      if(!this.state.isVerified){
        return(
          <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          You need to be verified by the admin in order for you to vote.
        </div>
        <div>
          Please wait until you are verified.
        </div>
        <ElectionName/>
          </div>
        );
      }


      if(this.state.hasVoted){
        return(
          <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          You have casted your vote.
        </div>
        <ElectionName/>
        </div>
        );
      }
    
   return (
    <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
          Cast Your VOTE
        </div>

    <Container>
      <Row>
        <Col md={{ span:4, offset:4}}>
          <Form>
            <Form.Group>
              <Form.Label>Enter Candidate ID you want to vote for</Form.Label>
              <Form.Control required className="text-center" type="text" placeholder="Enter ID" value= {this.state.candidateId} onChange={this.updateCandidateId} />
            </Form.Group>
            <div className="error_msg">
              {this.state.error_msg}
            </div>
            <Button variant="primary" onClick={this.vote}>
              Vote
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>


        <div className="candidates">
          <div className="cand_list">
            {candidateList}
          </div>
          
        </div>

        <ElectionName/>
    </div>
   );
  }
}

export default Vote;