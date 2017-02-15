import React, { Component, PropTypes } from 'react'
import Modal from 'components/Modal'
import './styles'

import io from 'socket.io-client'
import config from 'config'

export default class Gobang extends Component {
	constructor (props) {
		super(props)
		this.state = {
			online_count: 0,
			data: [],
			userInfo: {}
		}
		this.socket = io(config.socket_host + '/gobang')
		this.joinRoom = this.joinRoom.bind(this)
		this.toggleModal = this.toggleModal.bind(this)
		this.createRoom = this.createRoom.bind(this)
	}
	componentDidMount() {
		this.initState()
	}
	componentWillUnmount() {
		this.socket.close()
	}
	initState() {
		axios.get('/getUserInfo')
		.then((res) => {
			this.setState({
				userInfo: res.data
			})
		})

		this.updateRooms()

		this.socket.on('disconnect', function() {
			console.log('与服务其断开')
		})

		this.socket.on('reconnect', function() {
			console.log('重新连接到服务器')
		})
	}
	/*  加载更新所有房间信息  */
	updateRooms() {
		this.socket.on('Rooms', (data) => {
			console.log(data)
			this.setState({
				...data
			})
		})
	}
	/*  切换模态框  */
	toggleModal() {
		this.modal.toggle()
	}
	/*  创建房间  */
	createRoom() {
		this.socket.emit('Create', {
			userInfo: this.state.userInfo,
			room_name: '夜喵的房间',
			password: 'qweasd'
		})
	}
	/*  加入房间  */
	joinRoom() {

	}
	render() {
		let modalProps = {
			key: 'modal',
			ref: (ref) => this.modal = ref,
			title: '创建房间',
			cancelText: '取消',
			confirmText: '创建',
			width: 400,
			role: 'confirm',
			onCancel: () => this.modal.close(),
			onConfirm: () => {
				this.createRoom()
				this.modal.close()
			}
		}
		let userInfo = this.state.userInfo
		return (
			<div ref="view" className="gobang-view">
				<section className="user-header">
					<img className="user-avatar" src={ userInfo.avatar } />
					<div className="user-info">
						<h1 className="user-account">{ userInfo.name }</h1>
						{
							userInfo.gameData ? (
								<p className="user-game-data">
									游戏次数：{ userInfo.gameData.count }<br />
									胜率：{ userInfo.gameData.winRate }
								</p>
							) : (
								<small className="user-game-data">您仍未进行过比赛</small>
							)
						}
					</div>
				</section>
				<section className="tabs">
					<div className="online-count">
						在线人数：{ this.state.online_count }
					</div>
					<div className="btn-group">
						<button onClick={this.toggleModal}>快速开始</button>
						<button onClick={this.toggleModal}>创建房间</button>
					</div>
				</section>
				<section className="gobang-list">
				{
					this.state.data.length ? Array.from(this.state.data, (obj, i) => {
						return (<div className="gobang-item" key={i}>
							<div className="gobang-top">
								房间名：{ obj.room_name }<br />
								<small className={`gobang-status ${obj.status === '等待中' ? 'waiting' : 'playing'}`}>{ obj.status }</small>
							</div>
							<div className="gobang-main">
								<div className="gobang-player">
									<img className="avatar" src={ obj.owner.avatar } />
									<div className="name">{ obj.owner.name }</div>
								</div>
								VS
								{
									obj.challenger ? (
									<div className="gobang-player">
										<img className="avatar" src={ obj.challenger.avatar } />
										<div className="name">{ obj.challenger.name }</div>
									</div>
									) : (
									<div className="gobang-player">
										<div className="avatar placeholder">
											<i className="iconfont icon-lock"></i>
										</div>
										<div className="join-btn name" onClick={this.joinRoom}>点击加入</div>
									</div>
									)
								}
							</div>
						</div>)
					}) : (
						<aside className="no-data">现在没有房间 Q~Q , 要不你创一个吧</aside>
					)
				}
				</section>
				<Modal {...modalProps}>
					<p>NightCAT</p>
				</Modal>
			</div>
		)
	}
}

Gobang.propTypes = {
	location: PropTypes.any
}

Gobang.contextTypes = {
	router: React.PropTypes.any.isRequired
}