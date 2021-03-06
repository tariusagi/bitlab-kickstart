import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Campaign from '../ethereum/campaign';
import { Router } from '../routes';

class RequestRow extends Component {
	onApprove = async () => {
		const accounts = await web3.eth.getAccounts();
		const campaign = Campaign(this.props.address);
		await campaign.methods.approveRequest(this.props.id).send({ from: accounts[0] });
		Router.reload(window.location.pathname);
	};

	onFinalize = async () => {
		const accounts = await web3.eth.getAccounts();
		const campaign = Campaign(this.props.address);
		await campaign.methods.finalizeRequest(this.props.id).send({ from: accounts[0] });
		Router.reload(window.location.pathname);
	};

	render() {
		const { Row, Cell } = Table;
		const { id, request, approversCount } = this.props;
		const canFinalize = request.approvalCount > approversCount / 2;
		return (
			<Row disabled={request.complete} positive={canFinalize && !request.complete}>
				<Cell>{id}</Cell>
				<Cell>{request.description}</Cell>
				<Cell>{web3.utils.fromWei(request.value, 'ether')}</Cell>
				<Cell>{request.recipient}</Cell>
				<Cell>{request.approvalCount}/{approversCount}</Cell>
				<Cell>{request.complete || (request.approvalCount == approversCount) ? null : (
					<Button color='green' basic onClick={this.onApprove}>Approve</Button>
				)}
				</Cell>
				<Cell>{request.complete || (!canFinalize) ? null : (
					<Button color='teal' basic onClick={this.onFinalize}>Finalize!</Button>
				)}
				</Cell>
			</Row>
		);
	}
}

export default RequestRow;