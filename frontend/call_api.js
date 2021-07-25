import React, {useState} from 'react';
import {
    useBase,
    useRecords,
    useGlobalConfig,
    expandRecord,
    TablePickerSynced,
    ViewPickerSynced,
    FieldPickerSynced,
    FormField,
    Input,
    Button,
    Box,
    Icon,
} from '@airtable/blocks/ui';


const access_token_endpoint = 'https://oauth.casso.vn';

const INFO_TABLE = "INFO";
const NAME_FIELD = 'Name';
const EMAIL_FIELD = 'Email';

const API_TABLE = 'API_CALL';
const API_FIELD = 'API';

const MAX_RECORDS_PER_UPDATE = 50;
// const isUpdate = false;
export default function CallAPI() {
    const base = useBase();

    const apiTable = base.getTableByName(API_TABLE);
    const infoTable = base.getTableByName(INFO_TABLE);

    const apiField = apiTable.getFieldByName(API_FIELD);

    const apiRecords = useRecords(apiTable, {fields: [apiField]});
    const apiKey = apiRecords[0].getCellValueAsString(apiField);

    const nameField = infoTable.getFieldByName(NAME_FIELD);
    const emailField = infoTable.getFieldByName(EMAIL_FIELD);
    const infoRecords = useRecords(infoTable, {fields: [emailField], fields: [nameField]});
    // const permissionCheck = table.checkPermissionsForUpdateRecord(undefined, {
    //     [NAME_FIELD]: undefined,
    //     [EMAIL_FIELD]: undefined
    // });

    return (
        <div>
            {InputExample(apiKey, infoTable, infoRecords)}
        </div>
    );
}
function InputExample(apiKey, infoTable, infoRecords)  {
    const [access_token, getAccessToken] = useState("");
    return (
        <div>
            <Button onClick={() => GetAccessToken(apiKey, getAccessToken, infoTable, infoRecords)} icon="search">
                Get Access-Token
            </Button>
            {

                access_token ? (<div>{access_token.toString()}</div>) : (<div>{access_token.toString()}</div>)
            }
         </div>
    );
};

async function GetAccessToken(apiKey, getAccessToken, infoTable, infoRecords) {
    const data_raw = {'code': apiKey};

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data_raw)
    };

    const response = await fetch(`${access_token_endpoint}/v1/token`, request);
     
    const data_rep = await response.json();

    getAccessToken(data_rep.access_token.toString());

    const info = await GetUserInfo(data_rep.access_token.toString(), infoRecords);
    
    await updateRecords(infoTable, info);

    await delayAsync(10);
}

async function GetUserInfo(access_token, infoRecords) {
    const recordUpdates = [];
    
    for (const record of infoRecords) {
        const request = {
            method: 'GET',
            headers: { 'Authorization': access_token },
        };
    
        const response = await fetch(`${access_token_endpoint}/v1/userInfo`, request);
    
        const data_rep = await response.json();
        

        recordUpdates.push(
            {
                id: record.id,
                fields:
                    {
                        [EMAIL_FIELD]: data_rep.data.user.email,
                        [NAME_FIELD]: data_rep.data.business.name,
                    },
            }
        );
        await delayAsync(10);
    }

    
    return recordUpdates;
}

async function updateRecords(table, recordUpdates) {
    let i = 0;
    while (i < recordUpdates.length) {
        const updateBatch = recordUpdates.slice(i, i + MAX_RECORDS_PER_UPDATE);
        // await is used to wait for the update to finish saving to Airtable servers before
        // continuing. This means we'll stay under the rate limit for writes.
        await table.updateRecordsAsync(updateBatch);
        i += MAX_RECORDS_PER_UPDATE;
    }
    // await table.createRecordsAsync(recordUpdates);
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

