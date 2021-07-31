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

import {GetUserInfo} from './info.js';
import { GetTransaction } from './transactions.js';

const access_token_endpoint = 'https://oauth.casso.vn';

const INFO_TABLE = "INFO";
const NAME_FIELD = 'Name';
const EMAIL_FIELD = 'Email';

const API_TABLE = 'API_CALL';
const API_FIELD = 'API';

const TRANSACTIONS_TABLE = 'TRANSACTIONS';
const ID_TRANS_FIELD = 'ID';
const DATE_FIELD = 'Date';
const AMOUNT_FIELD = 'Amount';
const DESCRIPTION_FIELD = 'Description';

const MAX_RECORDS_PER_UPDATE = 50;
// const isUpdate = false;
export default function CallAPI() {
    const base = useBase();

    const apiTable = base.getTableByName(API_TABLE);
    const infoTable = base.getTableByName(INFO_TABLE);
    const transactionsTable = base.getTableByName(TRANSACTIONS_TABLE);

    const apiField = apiTable.getFieldByName(API_FIELD);

    const apiRecords = useRecords(apiTable, {fields: [apiField]});
    const apiKey = apiRecords[0].getCellValueAsString(apiField);

    const nameField = infoTable.getFieldByName(NAME_FIELD);
    const emailField = infoTable.getFieldByName(EMAIL_FIELD);
    const infoRecords = useRecords(infoTable, {fields: [emailField], fields: [nameField]});

    const id_transField = transactionsTable.getFieldByName(ID_TRANS_FIELD);
    const dateField = transactionsTable.getFieldByName(DATE_FIELD);
    const amountField = transactionsTable.getFieldByName(AMOUNT_FIELD);
    const descriptionField = transactionsTable.getFieldByName(DESCRIPTION_FIELD);

    const transIDRecords = useRecords(transactionsTable, {fields: [id_transField]});

    // const permissionCheck = table.checkPermissionsForUpdateRecord(undefined, {
    //     [NAME_FIELD]: undefined,
    //     [EMAIL_FIELD]: undefined
    // });

    return (
        <div>
            {InputExample(apiKey, infoTable, infoRecords, id_transField, transactionsTable, transIDRecords)}
        </div>
    );
}
function InputExample(apiKey, infoTable, infoRecords, id_transField, transactionsTable, transIDRecords)  {
    const [access_token, getAccessToken] = useState("");
    var now = new Date();
    var today = formatDate(now);

    const [fromDate, setFromDate] = useState(today);

    return (
        <div>
            <Input
                value = {fromDate}
                onChange= {e => setFromDate(e.target.value)}
                placeholder= "From date? The default value is 7 days if you blank."
                width = "300px"/>

            <Button onClick={() => 
                
                GetAccessToken(apiKey, getAccessToken, infoTable, infoRecords, 
                id_transField, transactionsTable, transIDRecords)} 
                
                icon="search">
                
                Get Transactions
            
            </Button>
            {

                access_token ? (<div>{access_token.toString()}</div>) : (<div>{access_token.toString()}</div>)
            }
         </div>
    );
};

async function GetAccessToken(apiKey, getAccessToken, infoTable, infoRecords, id_transField, transactionsTable, transIDRecords) {
    const data_raw = {'code': apiKey};

    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data_raw)
    };

    const response = await fetch(`${access_token_endpoint}/v1/token`, request);
     
    const data_rep = await response.json();

    getAccessToken(data_rep.access_token.toString());

    const info = await GetUserInfo(data_rep.access_token.toString(), infoRecords, access_token_endpoint, NAME_FIELD, EMAIL_FIELD);
    
    await GetTransaction(access_token_endpoint, data_rep.access_token.toString(), id_transField, transactionsTable, transIDRecords, 
        ID_TRANS_FIELD, DATE_FIELD, AMOUNT_FIELD, DESCRIPTION_FIELD);
    await updateRecords(infoTable, info);

    await delayAsync(10);
}

async function updateRecords(table, recordUpdates) {
    let i = 0;
    while (i < recordUpdates.length) {
        const updateBatch = recordUpdates.slice(i, i + MAX_RECORDS_PER_UPDATE);
        await table.updateRecordsAsync(updateBatch);
        i += MAX_RECORDS_PER_UPDATE;
    }
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    day = day - 7;
    return [year, month, day].join('-');
}