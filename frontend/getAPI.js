
import { Dialog, Input ,Button, Text, Box, Icon, colors, Loader} from "@airtable/blocks/ui";
import {FieldType} from '@airtable/blocks/models';
import React, { useState } from "react";


const access_token_endpoint = 'https://oauth.casso.vn';
export function GetAPI(base, apiTable) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [apiKey, getApiKey] = useState("");
    const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);
    function getInput (event){
        event.preventDefault();
        setIsDialogOpen(false);     
        setIsUpdateInProgress(true);
        createAPI_Table(base, apiTable, apiKey);
        setIsUpdateInProgress(false);
    }

    return (
        <Dialog
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClose={() => setIsDialogOpen(false)} width="400px" height="500px">
            <Dialog.CloseButton />
            {isUpdateInProgress ? (
                <Loader />
            ) : (
                <Box
                position="absolute"
                top="10"
                bottom="10"
                left="10"
                right="10"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                >
                <img width = "50%" height = "50%" src = 'https://my.casso.vn/assets/img/icon.png'/>

                <img width = "50%" height = "50%" src = 'https://my.casso.vn/assets/img/casso-logo.png' />
                <Text
                    padding = "10px"
                    >Type your Casso API key to start:</Text>
                <Box
                    padding = "10px"
                    marginBottom = "40"
                    >
                    <Input
                        type = "password"
                        width = "300px"
                        flex="auto"
                        padding ="5px"
                        value = {apiKey}
                        onChange = {e => getApiKey(e.target.value)}
                    />
                </Box>
              
                <Button
                    icon = "chevronRight"
                    variant= "danger"
                    onClick={getInput}></Button>
            </Box>
            )}
        </Dialog>
    )
}

async function createAPI_Table(base, apiTable, apiKey) {
    const API_TABLE = 'API_KEY';
    const API_FIELD = [{name: 'API', type: FieldType.SINGLE_LINE_TEXT}, 
                       {name: 'Access Token', type: FieldType.MULTILINE_TEXT}
                    ];
    
    if (base.hasPermissionToCreateTable(API_TABLE, API_FIELD)) {
        await base.createTableAsync(API_TABLE, API_FIELD);
    }
    apiTable = base.getTableByName(API_TABLE);

    const token_data = await getAccessToken(apiKey.toString());

    await delayAsync(1000);
    apiTable.createRecordAsync({
        'API': apiKey.toString(),
        'Access Token': token_data.access_token.toString()
    })
    
}

async function getAccessToken(apiKey) {
    const data_raw = {'code': apiKey};
    const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data_raw)
    };

    const response = await fetch(`${access_token_endpoint}/v1/token`, request); 
    const data_rep = await response.json();

    return data_rep;
}

function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}