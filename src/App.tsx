/* eslint-disable */
import React, { useState, useEffect } from "react";
import {Button, Input, Space, Table} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import axios from 'axios';


const App: React.FC = () => {
  const [fileList, setFileList] = useState<Array<any>>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');

  const getColumnSearchProps = (dataIndex: any) => ({
    // filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => {
      filterDropdown: (props: any) => {
      const searchInputHolder: { current: Input | null } = {current: null};
      return <div style={{ padding: 8 }}>
      <Input
        placeholder={`Search ${dataIndex}`}
        value={props.selectedKeys[0]}
        onChange={e => props.setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(props.selectedKeys, props.confirm(), dataIndex)}
        style={{ width: 188, marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => handleSearch(props.selectedKeys, props.confirm(), dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button onClick={() => handleReset(props.clearFilters())} size="small" style={{ width: 90 }}>
          Reset
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            props.confirm({ closeDropdown: false });
            setSearchText(props.selectedKeys[0]);
            setSearchedColumn(dataIndex);
          }}
        >
          Filter
        </Button>
      </Space>
    </div>
    },
    filterIcon: (filtered: any) => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        // setTimeout(() => searchInputHolder.current?.select());
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        text
      ) : null,
  });


  const handleSearch = (selectedKeys: any, confirm: () => void, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };


  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      ...getColumnSearchProps('fileName'),
      render: (text: string, record: any) => {
        return <div onClick={() => handleDownload(record.fileName, record.blobName)}>{text}</div>
      }
    },
    {
      title: 'File Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a: any, b: any) => a.category.localeCompare(b.category),
    },
    {
      title: 'Last Reviewed',
      dataIndex: 'lastReviewed',
      key: 'lastReviewed',
      sorter: (a: any, b: any) => a.lastReviewed.localeCompare(b.lastReviewed),
    },
  ]

  const handleDownload = (fileName: string, blobName: string) => {
    axios.get(`https://qorus-test.azurewebsites.net/QorusFile/${blobName}`)
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      console.log(error);
    })
  };

  const getAllFileList = () => {
    axios.get('https://qorus-test.azurewebsites.net/QorusFile')
    .then(res => {
      console.log(res);
      setFileList(res.data);
    })
    .catch(error => {
      console.log(error);
    })
  }

  useEffect(() => {
    getAllFileList();
  }, []);

  return (
    <React.Fragment>
      <Table dataSource={fileList} columns={columns} />
    </React.Fragment>
  );
};

export default App;