import React, {Component} from 'react';
import {Route, Switch, withRouter} from 'react-router-dom';
import Header from '../header';
import * as API from "../../api/API";
import {bindActionCreators} from "redux";
import {login_success} from "../../actions/login";
import {createSurveyResponse, generateSurveyForm} from "../../actions/surveyresponse";
import '../../stylesheets/statistics/StatisticsHome.css';

import {connect} from "react-redux";

import {alert_types} from '../../config/alert_types';
import AlertContainer from 'react-alert';
import {alertOptions, showAlert} from "../../config/alertConfig";

class StatisticsHome extends Component {

    constructor(){
        super();
        this.state = {
            survey_name:"",
            survey_type:"",
            end_date:"",
            start_time:"",
            participation_rate:"",
            participants:"",
            questions:[]

        };
    }

    componentWillMount(){

    }

    componentDidMount(){

        API.validateSession().then((response)=>{
            if(response.status===200){
                response.json().then((data)=>{
                    console.log("[StatisticsHome] ValidateSession: ", data);
                    this.setState({
                        ...this.state,
                        loggedIn : true,
                        email : data.email
                    });
                    this.props.login_success(data);
                });
            }
            else if(response.status===404){
                console.log("[StatisticsHome] ValidateSession user not logged in");
                this.setState({
                    ...this.state,
                    loggedIn : false
                });
                showAlert("User not authorized to access this page. Please login", alert_types.ERROR, this);
                setTimeout((()=>{
                    this.props.handlePageChange("/login");
                }),1000);
            }
            else if(response.status===401){
                console.log("[StatisticsHome] ValidateSession user not logged in");
                this.setState({
                    ...this.state,
                    loggedIn : false
                });
                showAlert("User not authorized to access this page. Please login", alert_types.ERROR, this);
                setTimeout((()=>{
                    this.props.handlePageChange("/login");
                }),1000);
            }
            else {
                console.log("Error ")
            }
        });

        console.log("StatisticsHome params: ", this.props.match.params);

        if(this.props.match.params.hasOwnProperty("survey_id")){
            console.log(this.props.match.params);
            console.log("[StatisticHome] param hasProperty survey_id :", this.props.match.params.hasOwnProperty("survey_id"));
            API.getSurveyBasicStats(this.props.match.params.survey_id).then((response)=>{
                console.log(response.status);
                if(response.status===200){
                    response.json().then((data)=>{
                        console.log("[StatisticHome] data:",data)
                        this.setState({
                            ...this.state,
                            survey_name:data.survey_name,
                            survey_type:data.survey_type,
                            end_date:data.end_date,
                            start_time:data.start_time,
                            participation_rate:data.participation_rate?parseFloat(data.participation_rate).toFixed(2):"",
                            participants:data.participants,
                            questions:data.questions

                        })
                    });
                }else if(response.status === 405){
                    console.log(" [StatisticHome] Error 405 in getSurveyById");
                    showAlert("Survey do not have enough data for statistic !!!", alert_types.INFO, this);
                    // alert("Survey do not have enough data for statistic !!!")
                    setTimeout((()=>{
                        this.props.handlePageChange("/home")
                    }), 1500)
                }else if(response.status===404){
                    console.log(" [StatisticHome] Error 404 in getSurveyById");
                    showAlert("Error while fetching Stats for survey", alert_types.ERROR, this);
                    // alert("Error 404 in getSurveyById");
                }
                else if(response.status===400){
                    console.log(" [StatisticHome] Error 400 in getSurveyById");
                    showAlert("Internal Server Error", alert_types.ERROR, this);
                    // alert("Error 400 in getSurveyById");
                }
            });
        }
    }

    getQuestionComponent() {
        return  this.state.questions.map((each_question)=>{
            return(
                <div className="statistics-question-component">
                    <label className="statistics-question-label">{each_question.question_text}</label>
                    <button type="button" className="statistics-question-button" onClick={() => {
                        // question id is hardcoded here
                        {this.props.handlePageChange("/stats/response/"+each_question.question_id );}
                    }}>Check Stats</button>
                </div>
            )
        });
    }

    render() {
        console.log("[StatisticsHome] render", this.props.survey);

        return (
            <div className="StatisticsHome">
                <Header
                    handlePageChange = {this.props.handlePageChange}
                    loggedIn = {true}
                />


                <div className="statistics-dashboard">
                    <div className="statistics-dashboard-header">
                        <span className="statistics-survey_name">{this.state.survey_name}
                            <span className="statistics-survey-type"> [ {this.state.survey_type} ]</span>
                        </span>

                        <span className="statistics-date-label">
                            <span style={{'font-size' : '14px'}}>Survey End Date: </span>
                            <strong>{this.state.end_date}</strong>
                        </span>

                        <span className="statistics-date-label">
                            <span style={{'font-size' : '14px'}}>Survey Start Date: </span>
                            <strong>{this.state.start_time}</strong>
                        </span>

                        <div className="statistics-block-1">
                            <div className="no-of-participants">Number of Participants</div>
                            <span className="no-of-participants-count">{this.state.participants}</span>
                        </div>

                        <div className="statistics-block-2">
                            <div className="no-of-participants">Participation Rate</div>
                            <span className="no-of-participants-count">{this.state.participation_rate} %</span>
                        </div>
                    </div>
                    <div>
                        <div className="statistics-dashboard-question-label">
                            <h3><span style={{color: "#2980B9"}}>Questions : </span></h3>
                        </div>
                        {this.getQuestionComponent()}
                    </div>

                </div>
                <AlertContainer ref={a => this.msg = a} {...alertOptions}/>
            </div>

        );
    }
}

function mapStateToProps(state) {
    console.log("SurveyResponse state: ", state);
    return{
        survey: state.survey_surveyresponse.survey,
        survey_response : state.survey_surveyresponse.survey_response,
        user : state.user.user
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            createSurveyResponse: createSurveyResponse,
            generateSurveyForm : generateSurveyForm,
            login_success: login_success
        }, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StatisticsHome));
