import Taro from "@tarojs/taro";
import React, { Component } from "react";
import {RichText} from "@tarojs/components";
import HtmlToJson from "./libs/html2json";


import './wxParse.css'

export default class Parser extends Component {

    static defaultProps = {
        loading: false,
        className: '',
        content: "",
        noData: '<div></div>',
        startHandler: (node) => {
            node.attr.class = null;
            node.attr.style = null;
        },
        endHandler: null,
        charsHandler: null,
        imageProp: {
            mode: 'aspectFit',
            padding: 0,
            webPadding: 0,
            lazyLoad: false,
            domain: '',
        },
        imageUrls: []
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }


    navigate(href) {
        // this.$emit('navigate', href, $event);
    };

    preview(src) {
        if (!this.imageUrls.length) return;
        if (typeof wx !== 'undefined') {
            Taro.previewImage({
                current: src,
                urls: this.imageUrls,
            });
        }
    };

    removeImageUrl(src) {
        const {imageUrls} = this;
        imageUrls.splice(imageUrls.indexOf(src), 1);
    };


    contentHtml = () => {
        const {
            content,
            noData,
            imageProp
        } = this.props;
        const parseData = content || noData;
        return HtmlToJson.htmlClean(parseData, imageProp);

    };

    render() {
        return (
            <RichText nodes={this.contentHtml()} />
        )
    }
}
