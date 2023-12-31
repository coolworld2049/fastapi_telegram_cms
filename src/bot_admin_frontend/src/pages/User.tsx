import {
  BooleanField,
  ChipField,
  Create,
  Datagrid,
  DateField,
  Edit,
  FilterLiveSearch,
  List,
  PasswordInput,
  ReferenceField,
  required,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import React from "react";

const UserPanel = (props: any) => (
  <SimpleShowLayout>
    <TextField source="id"/>

    <ReferenceField source="telegram_id" reference="botusers">
      <TextField source="id"/>
    </ReferenceField>
    <TextField source="full_name"/>
    <DateField source="updated_at" showTime={true}/>
    <BooleanField
      source="is_active"
      TrueIcon={PublicIcon}
      FalseIcon={PublicOffIcon}
      label={"Active"}
    />
  </SimpleShowLayout>
);


export const UserList = (props: any) => {
  const userFilters = [
    <FilterLiveSearch source="email" label={"Full Name"}/>,
    <FilterLiveSearch source="username" label={"Username"}/>,
  ];
  return (
    <List {...props} filters={userFilters} sort={{field: 'updated_at', order: 'DESC'}}>
      <Datagrid
        rowClick="edit"
        bulkActionButtons={false}
        expand={UserPanel}
        expandSingle={true}
      >
        <TextField source="email"/>
        <ReferenceField source="telegram_id" reference="botusers" link={"show"}>
          <ChipField source="username"/>
        </ReferenceField>
        <DateField source="created_at" showTime={true}/>
      </Datagrid>
    </List>
  );
};

export const UserEdit = (props: any) => (
  <Edit {...props} redirect="list">
    <SimpleForm>
      <TextInput source="id" disabled/>
      <TextInput source="username"/>
      <TextInput source="telegram_id" label={"Telegram id"}/>
    </SimpleForm>
  </Edit>
);

export const UserCreate = (props: any) => {
  return (
    <Create {...props} redirect="list">
      <SimpleForm mode="onBlur" reValidateMode="onBlur">
        <TextInput source="email" validate={required()}/>
        <PasswordInput source="password" validate={required()}/>
        <TextInput source="username"/>
      </SimpleForm>
    </Create>
  );
};
