/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Button, DatePicker, Form, Input, Modal, Space, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const App: React.FC = () => {
  const [fileList, setFileList] = useState<Array<any>>([]);
  const [filteredFileList, setFilteredFileList] = useState<Array<any>>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");
  const [addFileModal, setAddFileModal] = useState<boolean>(false);
  const [file, setFile] = useState<any>();
  const [category, setCategory] = useState<string>("");
  const [lastReviewed, setLastReviewed] = useState<any>();

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: (props: any) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${dataIndex}`}
            value={props.selectedKeys[0]}
            onChange={(e: any) =>
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
    render: (text: any) => searchedColumn === dataIndex && text,
  });

  const handleSearch = (
    selectedKeys: any,
    confirm: () => void,
    dataIndex: any
  ) => {
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);

    const data = fileList?.filter(res => res[dataIndex].toLowerCase().includes(selectedKeys[0].toLowerCase()));
    setFilteredFileList(data);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    setFilteredFileList(fileList);
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      ...getColumnSearchProps("fileName"),
      render: (text: any, record: any) => {
        return (
          <a onClick={() => handleDownload(record.fileName, record.blobName)}>
            {text}
          </a>
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
      ...getColumnSearchProps("category"),
      sorter: (a: any, b: any) => a.category.localeCompare(b.category),
      render: (text: any, record: any) => {
        return (
          <div>
            {text}
          </div>
        );
      },
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
      .then((response: any) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const getAllFileList = () => {
    axios
      .get("https://qorus-test.azurewebsites.net/QorusFile")
      .then((res: any) => {
        console.log(res);
        setFileList(res.data);
        setFilteredFileList(res.data);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const uploadFile = () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("Size", file.size);
    formData.append("FileName", file.name);
    formData.append("Category", category);
    formData.append("LastReviewed", lastReviewed);

    axios
      .post("https://qorus-test.azurewebsites.net/QorusFile", formData)
      .then((res: any) => {
        getAllFileList();
        setAddFileModal(false);
        setCategory("");
        setLastReviewed("");
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getAllFileList();
  }, []);

  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
  }

  return (
    <React.Fragment>
      <Modal
        centered
        destroyOnClose
        visible={addFileModal}
        onCancel={() => setAddFileModal(false)}
        title={"Upload file"}
        footer={false}
      >
        <Form>
          <Form.Item label="File">
            <input
              type="file"
              onChange={(e: any) => setFile(e.target.files[0])}
            />
          </Form.Item>
          <Form.Item label="Category">
            <Input
              data-testid="category"
              value={category}
              onChange={handleChangeCategory}
            />
          </Form.Item>
          <Form.Item label="Last reviewed">
            <DatePicker
              onChange={(date: any, dateString: any) =>
                setLastReviewed(dateString)
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={() => uploadFile()}>
              Upload file
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{ padding: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>File list</h2>
          <Button type="primary" onClick={() => setAddFileModal(true)}>
            Add file
          </Button>
        </div>
        <Table dataSource={filteredFileList} columns={columns} />
      </div>
    </React.Fragment>
  );
};

export default App;
