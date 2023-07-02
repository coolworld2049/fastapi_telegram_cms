import {
  ArrayField,
  BooleanField,
  BooleanInput,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DeleteButton,
  Edit,
  FileField,
  FileInput,
  List,
  RichTextField,
  SaveButton,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  Toolbar,
  useNotify,
  useRecordContext,
  useRefresh
} from "react-admin";
import {RichTextInput} from "ra-input-rich-text";
import dataProvider from "../dataProvider";
import React from "react";

export const PostPanel = () => {
  return (
    <SimpleShowLayout>
      <TextField source="id"/>
      <ArrayField source="files">
        <SingleFieldList>
          <ChipField source="title" size="small"/>
        </SingleFieldList>
      </ArrayField>
      <DateField source="updated_at" showTime={true}/>
    </SimpleShowLayout>
  )
};

export const PostList = (props: any) => {
  return (
    <List {...props} sort={{field: 'updated_at', order: 'DESC'}}>
      <Datagrid
        rowClick="edit"
        expand={<PostPanel {...props}/>}
        expandSingle={true}
      >
        <RichTextField source="text"/>
        <BooleanField source="is_published" label={"Published"}/>
        <DateField source="created_at" showTime={true}/>
      </Datagrid>
    </List>
  );
};

const PostPublishButton = (props: any) => {
  const refresh = useRefresh();
  const notify = useNotify();
  const record = useRecordContext(props);
  const handleSuccess = () => {
    dataProvider.create(`posts/${record.id}/publish`,
      {
        ...record.params,
      }
    ).then(r => {
      notify(`Post ${r.data.id} published!`, {type: 'success'})
      refresh()
    })
  };
  const handleError = (error: any) => {
    notify(`Post ${record.id} not published!${error}`, {type: 'error'})
  };
  return <SaveButton
    {...props}
    label={"Publish"}
    mutationOptions={{onSuccess: handleSuccess, onError: handleError}}
    variant="outlined"
    alwaysEnable={!(record.is_published)}
  />;
};

const PostPublishToolbar = (props: any) => {
  return (
    <Toolbar {...props}>
      <SaveButton/>
      <PostPublishButton variant="outlined"/>
      <DeleteButton variant={"text"}/>
    </Toolbar>
  )
};


export const PostEdit = (props: any) => (
  <Edit {...props} redirect="edit">
    <SimpleForm toolbar={<PostPublishToolbar/>}>
      <TextInput source="id" disabled/>
      <BooleanInput source="is_published"/>
      <RichTextInput source="text"/>
      <FileInput source="files" multiple>
        <FileField source="src" title="title" download target={"_blank"}/>
      </FileInput>
    </SimpleForm>
  </Edit>
);


export const PostCreate = () => (
  <Create redirect={"edit"}>
    <SimpleForm>
      <TextInput source="id" disabled/>
      <RichTextInput source="text"/>
      <FileInput source="files" multiple>
        <FileField source="src" title="title" download target={"_blank"}/>
      </FileInput>
    </SimpleForm>
  </Create>
);
