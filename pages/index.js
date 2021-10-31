import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';

class CampaignIndex extends Component {
	// This is a NextJS method. It's a class method (static).
	// We put code to initialize data here because it is called at the server side
	// by Next to prepare initial props data, so we're sure that our code will be
	// executed.
	static async getInitialProps() {
		const campaigns = await factory.methods.getDeployedCampaigns().call();
		// Return the array of campaigns as props.
		return { campaigns };
	}

	renderCampaigns() {
		const items = this.props.campaigns.map(address => {
			return {
				header: address,
				description: (
					<Link route={`/campaigns/${address}`}>
						<a>View campaign</a>
					</Link>
				),
				fluid: true
			};
		});

		return <Card.Group items={items} />
	}

	render() {
		return (
			<Layout>
				<div>
					<h3>Campaigns List:</h3>

					<Link route='/campaigns/new'>
						<a>
							<Button
								content='Create campaign'
								icon='add circle'
								primary
								floated="right"
							/>
						</a>
					</Link>

					{this.renderCampaigns()}
				</div>
			</Layout>
		)
	}
}

export default CampaignIndex;