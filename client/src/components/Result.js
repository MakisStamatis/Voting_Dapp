import React from "react";
import VoteContract from "../contracts/VoteContract.json";
import getWeb3 from "../getWeb3";

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';
import ElectionName from './ElectionName';

import { Container,Row,Col,Spinner } from 'react-bootstrap';

class Result extends React.Component {
  //constructor of the class
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      toggle:false,
      result:null,
      isOwner:false,
      candidateList:null,
      start:false,
      end:false,
      election_id:null
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

        let candidateCount = await this.state.VoteInstance.methods.getCandidateNumber(this.state.election_id).call();
        this.setState({ candidateCount : candidateCount });
    
        //populate the candidate list
        let candidateList = [];
        candidateList = await this.state.VoteInstance.methods.getCandidates(this.state.election_id).call();
    
        //sort the list based on votes
        candidateList.sort((a,b) => b.voteCount - a.voteCount);
        let winStr = "(WINNER) ";
        let tieStr = "(TIE) ";
        let tieCounter = 0;

        //check if there is a TIE 
        for(let i=1; i<candidateCount;i++){
          if(candidateList[i].voteCount === candidateList[0].voteCount){
            tieCounter++;
          }else{
            break;
          }
        }
        //concatenate the appropriate string to winner/winners
        if(candidateCount >= 2 && tieCounter===0){
          candidateList[0].name = winStr.concat(candidateList[0].name);
        }else if(tieCounter>0){
          for(let i=0;i<=tieCounter;i++){
            candidateList[i].name = tieStr.concat(candidateList[i].name);
          }
        }

        this.setState({candidateList : candidateList});

        //get owner of the election
        const owner = await this.state.VoteInstance.methods.getElectionOwner(this.state.election_id).call();
        if(this.state.account === owner){
          this.setState({isOwner : true});
        }

        //get status of the election (if it has started or has ended)
        let start = await this.state.VoteInstance.methods.getStart(this.state.election_id).call();
        let end = await this.state.VoteInstance.methods.getEnd(this.state.election_id).call();

        this.setState({start : start, end : end });
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
    if(document.getElementById('nav_result') !== null){
      document.getElementById('nav_result').classList.add("active");
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
            <div className="candidateVotes">Votes: {candidate.voteCount}</div>
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


    if(!this.state.end){
      return(
        <div className="App">
        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        <div className="under_nav">
        The Voting Process needs to end before you can check the results.
        </div>
        <ElectionName/>
      </div>
      );
    }

    return (
      <div className="App">
      {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
      <div className="under_nav">
        Voting Results
      </div>
      
      <div className="cand_list">
        {candidateList}
      </div>

      <ElectionName/>
    </div>
    );
  }
}

export default Result;