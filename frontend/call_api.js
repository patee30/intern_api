import React, {useState} from 'react';
import {
    useBase,
    useRecords,
    useGlobalConfig,
    expandRecord,
    TablePickerSynced,
    ViewPickerSynced,
    FieldPickerSynced,
    colors,
    FormField,
    Input,
    Button,
    Box,
    Icon,
} from '@airtable/blocks/ui';

import {GetUserInfo} from './info.js';
import { GetTransaction } from './transactions.js';
import { GetAPI } from './getAPI.js';
const access_token_endpoint = 'https://oauth.casso.vn';

const INFO_TABLE = "INFO";
const NAME_FIELD = 'Name';
const EMAIL_FIELD = 'Email';

const API_TABLE = 'API_KEY';
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

    const apiTable = base.getTableByNameIfExists(API_TABLE);
    const [isAPI, setIsAPI] = useState(apiTable == null ? true : false);
    if (apiTable != null) {
        if (apiTable.getFieldByNameIfExists('API') == null) setIsAPI(false);
        // else {
        //     const apiField = apiTable.getFieldByName('API');
        //     const apiRecords = useRecords(apiTable, {fields: [apiField]});
        //     const apiKey = apiRecords[0].getCellValueAsString(apiField);
        //     if (apiKey == "") setIsAPI(false);
        // }
    }
    
    const infoTable = base.getTableByName(INFO_TABLE);
    const transactionsTable = base.getTableByName(TRANSACTIONS_TABLE);

    // const apiField = apiTable.getFieldByName(API_FIELD);

    //  const apiRecords = useRecords(apiTable, {fields: [apiField]});
    // const apiKey = apiRecords[0].getCellValueAsString(apiField);
    const apiKey = "48087af0-ec56-11eb-bd43-a599ec8fd1f2";
    const nameField = infoTable.getFieldByName(NAME_FIELD);
    const emailField = infoTable.getFieldByName(EMAIL_FIELD);
    const infoRecords = useRecords(infoTable, {fields: [emailField], fields: [nameField]});

    const id_transField = transactionsTable.getFieldByName(ID_TRANS_FIELD);
    const dateField = transactionsTable.getFieldByName(DATE_FIELD);
    const amountField = transactionsTable.getFieldByName(AMOUNT_FIELD);
    const descriptionField = transactionsTable.getFieldByName(DESCRIPTION_FIELD);

    
    const transIDRecords = useRecords(transactionsTable, {fields: [id_transField]});

    return (
        <div>
            {isAPI?
                GetAPI(base, apiTable)
                 :
            GetThings(apiKey, infoTable, infoRecords, transactionsTable, transIDRecords,base)
            }
        </div>
    );
};

function Test({dataInput, setDataInput}) {   
    function onChange(event) {
        setDataInput(event.currentTarget.value);
    }
    return (
        <FormField 
                margin = "20px"
                label="FromDate">
                
                <Input
                    padding= "5px"                  
                    value = {dataInput}
                    onChange= {onChange}
                    width = "300px"
                />
        </FormField>
    );
}

function API_KEY({}) {
    return (
        <Box>
            <FormField 
                margin = "20px"
                label="FromDate">
                
                <Input
                    padding= "5px"                  
                    value = {dataInput}
                    onChange= {onChange}
                    width = "300px"
                />
            </FormField>

        </Box>
    );
}
function GetThings(apiKey, infoTable, infoRecords, transactionsTable, transIDRecords,base)  {
    const [access_token, getAccessToken] = useState("");
    var now = new Date();
    var today = formatDate(now);
    const [fromDate, setFromDate] = useState(today);
    const [page, setPage] = useState("1");
    const [pageSize, setPageSize] = useState("10");
    return (
        <Box
        paddingX={3}
        paddingY={2}
        marginRight={-2}
        borderBottom="default"
                 
            >
            <Test dataInput= {fromDate} setDataInput = {setFromDate}/>
            <Test dataInput = {page} setDataInput = {setPage} />
            <Test dataInput = {pageSize} setDataInput = {setPageSize} />

                <Button 
                    width = "300px"
                    variant="primary"
                    onClick={() =>                
                        GetAccessToken(apiKey, getAccessToken, infoTable, infoRecords, 
                            transactionsTable, transIDRecords, fromDate, page, pageSize,base)} icon="search">
                        
                        Get Transactions
                </Button>
                       
         </Box>
    );
};

async function GetAccessToken(apiKey, getAccessToken, infoTable, 
    infoRecords, transactionsTable, transIDRecords, fromDate, page, pageSize,base) {

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
    
    await GetTransaction(access_token_endpoint, data_rep.access_token.toString(), transactionsTable, transIDRecords, 
        ID_TRANS_FIELD, DATE_FIELD, AMOUNT_FIELD, DESCRIPTION_FIELD, fromDate, page, pageSize);
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