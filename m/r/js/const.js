var pConst = {
    subsysDbNames: {
        1: "ytb_manager",
        2: "ytb_user",
        3: "ytb_project",
        4: "ytb_account",
        5: "ytb_tasklog",
        6: "ytb_bangbang",
        7: "ytb_activiti",
        8: "ytb_user"
    },
    porjectConfigItems: {
        100: "100-洽谈感谢金(元)",
        101: "101-文档协助金(元)",
        200:"200-终止确认冷静期(天)",
        201:"201-自动终止时间(天)"
    },
    porjectConfigItemsCode:{
        100:"TALK_MONEY",
        101:"HELP_MONEY",
        200:"TermConfirm_Day",
        201:"AutoTerm_Day",
     },

    TemplateRecordIni: {
        repositoryId: 0,
        workJobId: 0,
        title: "",
        docType: 904,
        state: 0,
        phase: 0,
        user: 0,
        // stopQ: 0,
        // stopAction : ""
    },
    //0: "0 通用",
    cPrjPhase: {
        1: "1 阶段",
        3: "3 阶段", // 不区分造型非造型
        30: "3 阶段非造型界面(30)",
        31: "3 阶段造型界面(31)",
        6: "6 阶段",
        8: "8 阶段"
    },
    cPrjSubTypeStop:{
        801:"801--取消项目", //200
        802:"802--甲方超过3次审核,乙方交付不合格",//300
        803:"803--延期率>500%",//400
        804:"804--造型界面类超过3次审核,甲方不满意",//500 甲方超过3次审核,仅用于造型界面类
        805:"805--乙方不满意", //600
    },
    cPrjSubTypeChng:{
        701:"701--小变更",
        702:"702--大变更",
    },
    cUser: {
        0: "0--通用",
        1: "1--甲方",
        2: "2--乙方"
    },
    cDocStatus: {
        0: "0--草稿",
        1: "1--发布",
        2: "2--停用"
    },
    cDocStatusChng: {
        0: 1,
        1: 2,
        2: 1
    },
    cDocBtn:{
        0: "发布",
        1: "停用",
        2: "发布"
    },
    DOCTYPE_CHNG: 903,
    DOCTYPE_TERM: 904,

    cDocType: {
        901: "901--保密协议模板",
        902: "902--三方协作合同",
        903: "903--需求变更文档",
        904: "904--项目终止文档"
    },
    cTagType: {
        1: "兴趣爱好",
        2: "专业能力",
        3: "经营范围标签"
    },
    cChannelTypes: {
        0: "通用",
        1: "站内通知",
        2: "短信息SMS",
        3: "微信公众号",
        4: "邮箱"
    },
    cNotifyTypeList: {
        0: "通用",
        1: "任务通知",
        2: "交易通知",
        3: "系统通知"
    },
    cTemplateTypelList: { //通知模板类型
        0: "通用",
        1: "提醒",
        2: "催促",
        3: "警告"
    }
};


