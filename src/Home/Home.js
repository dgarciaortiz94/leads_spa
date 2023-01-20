import React from "react";
import './styles/home.css';
import 'animate.css/animate.css'

class Home extends React.Component {
    constructor() {
        super();

        this.state = { 
            vissibleLead: null,
            leads: [],
            closedLeads: [],
            leadStatus: [],
            statusFilter: "",
            responseMessage: "",
        };
    }


    componentDidMount() {
        fetch(process.env.REACT_APP_API_PATH + '/leads')
            .then(response => response.json())
            .then(data => this.setState({leads: data}))
            .catch(error => console.log(error));

        fetch(process.env.REACT_APP_API_PATH + '/lead-status')
            .then(response => response.json())
            .then(data => this.setState({leadStatus: data}))
            .catch(error => console.log(error));
    }


    showLead = id => {
        fetch(process.env.REACT_APP_API_PATH + '/leads/' + id)
            .then(response => response.json())
            .then(data => this.setState({vissibleLead: data}))
            .catch(error => console.log(error));
    }


    filterByStatus = e => {
        e.preventDefault();

        this.setState({vissibleLead: null});

        let endpoint = (this.state.statusFilter) ? '/leads?status[equal]=' : '/leads';
        let statusId = this.state.statusFilter;

        fetch(process.env.REACT_APP_API_PATH + endpoint + statusId)
            .then(response => response.json())
            .then(data => this.setState({leads: data}))
            .catch(error => console.log(error));
    }


    renderVissibleLead() {
        if (this.state.vissibleLead != null) {
            return (
                <div className="vissible-lead">
                    <table className="table">
                        <tbody>
                            <tr>
                                <th>Título</th>
                                <td>{this.state.vissibleLead.title}</td>
                            </tr>
                            <tr>
                                <th>Fecha</th>
                                <td>{this.state.vissibleLead.created_at}</td>
                            </tr>
                            <tr>
                                <th>Estado</th>
                                <td>{this.state.vissibleLead.status}</td>
                            </tr>
                            <tr>
                                <th>Fecha de cierre</th>
                                <td>{this.state.vissibleLead.closed_at}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    }


    closeLeads() {
        let success = false;

        this.setState({responseMessage: ""});

        fetch(process.env.REACT_APP_API_PATH + '/leads/close-leads', {
            method: 'PATCH',
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          })
            .then(response => response.json())
            .then(data => {
                success = true;
                this.setState({responseMessage: <div className="response-message success animate__animated animate__fadeInDown">Los leads con más de 6 meses de antigüedad han sido cerrados</div>});
            })
            .catch(error => {
                this.setState({responseMessage: <div className="response-message error animate__animated animate__fadeInDown">Lo sentimos, ocurrió un error al cerrar los leads</div>});
            });

        if (success) {
            fetch(process.env.REACT_APP_API_PATH + '/leads')
                .then(response => response.json())
                .then(data => this.setState({leads: data}))
                .catch(error => console.log(error));
        }
    }


    render() {
        let vissibleLeadElement = this.renderVissibleLead();

        return (
            <div className="container">
                <div className="leads-wrapper">
                    <form onSubmit={e => this.filterByStatus(e)}>
                        <label htmlFor="status" className="d-block">Filtrar por estado</label>
                        <div className="d-flex align-items-center mt-2 mb-4">
                            <select name="status" value={this.state.stausFilter} onChange={e => this.setState({statusFilter: e.target.value})}>
                                <option value="">Mostrar todos</option>
                                {this.state.leadStatus.map(status => {
                                    return (
                                        <option value={status.id} key={status.id}>{status.name}</option>
                                    );
                                })}
                            </select>

                            <button type="submit" className="btn btn-dark btn-sm">Filtrar</button>
                        </div>
                    </form>

                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Fecha de creación</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.leads.map(lead => {
                                    return (
                                    <tr key={lead.id}>
                                        <td>{lead.title}</td>
                                        <td>{lead.created_at}</td>
                                        <td>
                                            <span type="button" onClick={() => this.showLead(lead.id)}>Mostrar</span>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {vissibleLeadElement}
                    </div>

                    {this.state.responseMessage}

                    <button className="btn btn-primary mt-4 close-button" onClick={() => { this.closeLeads() }}>Cerrar leads con más de 6 meses</button>
                </div>
            </div>
        );
    }

}

export default Home;
