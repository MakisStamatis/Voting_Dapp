import React from "react";
import { Navbar ,Nav ,NavDropdown} from 'react-bootstrap';

class NavBarAdmin extends React.Component {
    render() {
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
                <NavDropdown title={<span className="" id="admin_span">Admin</span>} id="basic-nav-dropdown">
                    <NavDropdown.Item href="/VerifyVoter" id="nav_verify">Verify Voters</NavDropdown.Item>
                    <NavDropdown.Item href="/AddCandidate" id="nav_add">Add Candidate</NavDropdown.Item>
                    <NavDropdown.Item href="/Start_End" id="nav_start_end">START/END</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            </Navbar.Collapse>
            <Navbar.Brand className="nav navbar-nav navbar-right">Election Admin</Navbar.Brand>
        </Navbar>

       );
    }
}

export default NavBarAdmin;