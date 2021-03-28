/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Button, DatePicker, Form, Input, Modal, Space, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from 'moment';

const App: React.FC = () => {
  const [fileList, setFileList] = useState<Array<any>>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");
  const [addFileModal, setAddFileModal] = useState<boolean>(false);
  const [file, setFile] = useState<any>();
  const [category, setCategory] = useState<string>('');
  const [lastReviewed, setLastReviewed] = useState<any>();

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: (props: any) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${dataIndex}`}
            value={props.selectedKeys[0]}
            onChange={(e) =>
              props.setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(props.selectedKeys, confirm, dataIndex)
            }
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                handleSearch(props.selectedKeys, confirm, dataIndex)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => handleReset(props.clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record.dataIndex
        ? record.dataIndex
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        // setTimeout(() => searchInputHolder.current?.select());
      }
    },
    render: (text: any) => searchedColumn === dataIndex && "",
  });

  const handleSearch = (
    selectedKeys: any,
    confirm: () => void,
    dataIndex: any
  ) => {
    // confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);

    // const filteredData = fileList.filter(entry =>
    //   entry[dataIndex].includes(searchText)
    // );
    // console.log('######-', selectedKeys, dataIndex, filteredData)
    // setFileList(filteredData);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      ...getColumnSearchProps("fileName"),
      render: (text: any, record: any) => {
        return (
          <div onClick={() => handleDownload(record.fileName, record.blobName)}>
            {text}
          </div>
        );
      },
    },
    {
      title: "File Size",
      dataIndex: "size",
      key: "size",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a: any, b: any) => a.category.localeCompare(b.category),
    },
    {
      title: "Last Reviewed",
      dataIndex: "lastReviewed",
      key: "lastReviewed",
      sorter: (a: any, b: any) => a.lastReviewed.localeCompare(b.lastReviewed),
    },
  ];

  const handleDownload = (fileName: string, blobName: string) => {
    axios
      .get(`https://qorus-test.azurewebsites.net/QorusFile/${blobName}`)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getAllFileList = () => {
    axios
      .get("https://qorus-test.azurewebsites.net/QorusFile")
      .then((res) => {
        console.log(res);
        setFileList(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const uploadFile = () => {
    console.log('####--', file);
    console.log('####--', lastReviewed);
    console.log('####--', category);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('Size', file.size);
    formData.append('FileName', file.name);
    formData.append('Category', category);
    formData.append('LastReviewed', lastReviewed);

    axios
      .post("https://qorus-test.azurewebsites.net/QorusFile", formData)
      .then((res) => {
        getAllFileList();
        setAddFileModal(false);
        setCategory('');
        setLastReviewed('');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getAllFileList();
  }, []);

  return (
    <React.Fragment>
      <Modal
        centered
        destroyOnClose
        visible={addFileModal}
        onCancel={() => setAddFileModal(false)}
        title={'Upload file'}
        footer={false}
      >
        <Form>
          <Form.Item label="File">
            <input type='file' onChange={(e: any) => setFile(e.target.files[0])}  />
          </Form.Item>
          <Form.Item label="Category">
            <Input value={category} onChange={(e: any) => setCategory(e.target.value)} />
          </Form.Item>
          <Form.Item label="Last reviewed">
            <DatePicker onChange={(date: any, dateString: any) => setLastReviewed(dateString)} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => uploadFile()}>
              Upload file
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{padding: 30}}>
      <div style={{ display: "flex", justifyContent: 'space-between' }}>
        <h2>File list</h2>
        <Button type="primary" onClick={() => setAddFileModal(true)}>
          Add file
        </Button>
      </div>
      <Table dataSource={fileList} columns={columns} />
      </div>
    </React.Fragment>
  );
};

export default App;
