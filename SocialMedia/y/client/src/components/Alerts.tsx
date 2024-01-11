import Alert from 'react-bootstrap/Alert';

function Alerts(alertName:string,settingName:string){
    switch(alertName){
        case "success":{
            return(
                <>
                <Alert variant={alertName}>
                    Your {settingName} was successfully change!
                </Alert>
                </>
            );
        }
        default:{
            return(
                <>
                <Alert variant='danger'>
                    Something happend with server and we couldn't update your settings.
                </Alert>
                </>
            );
        }
    }
    
}
export default Alerts;