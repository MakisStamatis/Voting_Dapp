import React from "react";
import VoteContract from "../contracts/VoteContract.json";
import getWeb3 from "../getWeb3";

import {Container,Row,Col ,Spinner} from 'react-bootstrap';

import '../index.css';

import NavBarAdmin from './NavBarAdmin';
import NavBar from './NavBar';
import ElectionName from './ElectionName';


class Candidates extends React.Component {
  //constructor of the class
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      VoteInstance: undefined,
      account: null,
      web3: null,
      candidateCount: 0,
      candidateList: null,
      loaded:false,
      isOwner:false,
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

        this.setState({candidateList : candidateList});

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
    if(document.getElementById('nav_candidates') !== null){
      document.getElementById('nav_candidates').classList.add("active");
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
    
    return (
      <div className="App">

        {this.state.isOwner ? <NavBarAdmin /> : <NavBar />}
        
        <div className="under_nav">
          Total Number of Candidates : {this.state.candidateCount}
        </div>
        <div className="cand_list">
          {candidateList}
        </div>

        <ElectionName/>
      </div>

    );
  }
}
export default Candidates;