import * as React from 'react';
import styles from './PowerAutomateSpfx.module.scss';
import type { IPowerAutomateSpfxProps } from './IPowerAutomateSpfxProps';
import { escape } from '@microsoft/sp-lodash-subset';

interface IPowerAutomateSpfxState {
  responseMessage: string;
  isLoading: boolean;
}

export default class PowerAutomateSpfx extends React.Component<IPowerAutomateSpfxProps, IPowerAutomateSpfxState> {
  
  constructor(props: IPowerAutomateSpfxProps) {
    super(props);
    this.state = {
      responseMessage: '',
      isLoading: false
    };
  }
  private handleTriggerFlow = async (): Promise<void> => {
    this.setState({ isLoading: true, responseMessage: 'Triggering flow...' });
    
    const requestBody = {
      Title: 'Test from SPFx',
      UserEmail: this.props.userEmail
    };
    
    try {
      const response = await this.props.triggerFlow(requestBody, this.props.url);
      this.setState({ 
        isLoading: false, 
        responseMessage: `Success: ${JSON.stringify(response, null, 2)}` 
      });
    } catch (error) {
      this.setState({ 
        isLoading: false, 
        responseMessage: `Error: ${error.message || 'Unknown error occurred'}` 
      });
    }
  }

  public render(): React.ReactElement<IPowerAutomateSpfxProps> {
    const {
      url,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.powerAutomateSpfx} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Hello, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          <div>Flow URL: <strong>{escape(url)}</strong></div>
        </div>
        <div>
          <h3>Power Automate Integration</h3>
          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => this.handleTriggerFlow()}
              disabled={this.state.isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: this.state.isLoading ? '#ccc' : '#0078d4',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: this.state.isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {this.state.isLoading ? 'Processing...' : 'Trigger Power Automate Flow'}
            </button>
          </div>
          
          {this.state.responseMessage && (
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f4f4f4', 
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              fontSize: '12px'
            }}>
              <strong>Response:</strong><br />
              {this.state.responseMessage}
            </div>
          )}
        </div>
      </section>
    );
  }
}
