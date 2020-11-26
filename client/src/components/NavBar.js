import React from "react";
import { Navbar ,Nav } from 'react-bootstrap';


class NavBar extends React.Component {
    render(){
       return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand >E-Voting</Navbar.Brand>
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="/" id="nav_home">Home</Nav.Link>
                    <Nav.Link href="/Candidates" id="nav_candidates">Candidates</Nav.Link>
                    <Nav.Link href="/ApplyToVote" id="nav_apply_to_vote">Apply to Vote</Nav.Link>
                    <Nav.Link href="/Vote" id="nav_vote">VOTE</Nav.Link>
                    <Nav.Link href="/Result" id="nav_result">Results</Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Navbar>
       );
    }
}

export default NavBar;