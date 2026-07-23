import {getEnterpriseProviderAdapter} from './enterprise-provider-adapters';
describe('Enterprise provider adapters',()=>{
 it('normalizes a Workday worker',()=>{const x=getEnterpriseProviderAdapter('WORKDAY').normalize({Worker_ID:'W1',Worker:'Adeel Khan',Email_Address:'A@EXAMPLE.COM'});expect(x).toMatchObject({externalId:'W1',displayName:'Adeel Khan',email:'a@example.com',objectType:'EMPLOYEE'})});
 it('builds a Slack message without sending it',()=>{expect(getEnterpriseProviderAdapter('SLACK').buildMessage?.({destinationId:'C1',text:'Hello'})).toEqual({channel:'C1',text:'Hello',blocks:undefined})});
});
