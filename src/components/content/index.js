import React from 'react';
import * as $ from 'jquery';
import { Modal, Form, Input, Select, Icon } from 'antd';
import socket from '../../util/socket.js';
import { addToList } from '../../util/storage.js';

export class Content extends React.Component {
    state = { isVisible: false, dir: [] };
    dir = '';
    filenames = [];
    render() {
        socket.on('get-module', modulesNames => {
            $('#content .module .only_output').remove();
            modulesNames.forEach(name => {
                $('#content .module').append(onlyOutputBattery(name));
            })
        })
        return (
            <div id="content">
                <div className="module">
                    <div className="reload">
                        <div onClick={this.click.bind(this)}>hello</div>
                        <Icon type="reload"
                            style={{ fontSize: 18, color: '#999' }}
                            onClick={() => socket.emit('get-module', null)}
                        />
                    </div>
                </div>
                <Modal
                    title="新建文件"
                    visible={this.state.isVisible}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.onCancel.bind(this)}
                >
                    <Form>
                        <Form.Item label="选择所属文件夹" hasFeedback>
                            <Select placeholder="请选择" onChange={this.onChange.bind(this)}>
                                {
                                    this.state.dir.map((item, index) => {
                                        return (
                                            <Select.Option value={item} key={index}>{item}</Select.Option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="多个文件名用空格分割" hasFeedback>
                            <Input defaultValue="index.js pre.js" title="filename" onBlur={this.onBlur.bind(this)} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        )
    }
    click(e) {
        const dir = JSON.parse(sessionStorage.getItem('dir'));
        if (dir) {
            this.setState({ isVisible: !this.state.isVisible, dir: dir });
        }
    }
    onChange(value) {
        this.dir = value;
    }
    onBlur(e) {
        this.filenames = e.target.value.replace(/^\s*/, '').replace(/\s*$/, '').split(' ');
    }
    onCancel() {
        this.setState({ isVisible: false });
    }
    handleOk() {
        if (this.dir && this.filenames) {
            this.setState({ isVisible: false });

            socket.emit('make-file', { dir: this.dir, filename: this.filenames });
            this.filenames.forEach(name => {
                // 先把新建的文件保存，在返回值值中含有，id,dir,name;
                const info = addToList(this.dir, name);
                if (info) {
                    $(battery(info)).appendTo($('#content'));
                }
            })
        }
    }
}

function battery(info) {
    const path = `${info.dir}/${info.name}`;
    return (
        `<div class="battery" id="${info.id}">
            <p class="title" title="${path}">${path}</p>
            <span class="input"></span>
            <span class="output"></span>
        </div>`
    )
}

function onlyOutputBattery(text) {
    return (
        `<div class="battery only_output">
            <p class="title" title="${text}">${text}</p>
            <span class="output"></span>
        </div>`
    )
}