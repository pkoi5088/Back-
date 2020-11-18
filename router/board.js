var express = require('express'); 
var router = express.Router();
var db_config = require('../config/database');
var conn = db_config.init();
db_config.connect(conn);

router.get('/', function(req, res, next) {
    var sql ='select B.boardID,U.userName,B.title,B.postDate from board B, user U where B.userID=U.userID order by postDate DESC';
    var result;
    conn.query(sql,function(err, re){
        if(err){
            console.log('err: ' + err);
        }else{
            result=re;
        }
    });
    res.render('board/board',{userID: req.session.userID, boardData: result});
});

router.get('/post', function(req, res, next) {
    var boardID = req.params.id;
    var sql ='select U.userName,B.title,B.postDate,B.description from board B, user U where B.userID=U.userID and B.boardID=?';
    conn.query(sql,boardID,function(err, re){
        if(err){
            console.log('err: ' + err);
        }else{
            result=re;
        }
    });
    res.render('board/post',{userID: req.session.userID, postData: result});
});

router.get('/create', function(req, res, next) {
    if(!req.session.userID){
        res.send('<script>alert("로그인이 필요합니다."); location.href="/"</script>');
    }
    res.render('board/create',{userID: req.session.userID});
});

router.post('/create', function(req, res, next) {
    if(!req.session.userID){
        res.send('<script>alert("로그인이 필요합니다."); location.href="/"</script>');
    }
    var userID = req.session.userID;
    var body = req.body;
    var title = body.title;
    var description = body.description;
    var max;
    var sql = 'insert into board values(?,?,?,?,curdate())';
    var param;
    
    conn.query('select max(boardID) as Max form board',function(err, result){
        if(err){
            console.log('err: ' + err);
        }else{
            max=(result.M)*1;
        }
    });
    param = [max+1,userID,title,description];
    conn.query(sql,param,function(err, result){
        if(err){
            console.log('err: ' + err);
        }else{
            res.redirect('/board');
        }
    });
});

router.get('/delete', function(req, res, next) {
    if(!req.session.userID){
        res.send('<script>alert("로그인이 필요합니다."); location.href="/"</script>');
    }
    var userID = req.session.userID;
    var boardID = req.params.id;
    conn.query('select userID form board where boardID=?',boardID,function(err, result){
        if(err){
            console.log('err: ' + err);
        }else if(result.length==0||result.userID!=userID){
            res.send('<script>alert("작성자만 삭제 가능합니다."); location.href="/"</script>');
        }else{
            conn.query('delete from board where boardID=?',boardID,function(err, result){
                if(err){
                    console.log('err: ' + err);
                }else{
                    res.redirect('/board');
                }
            });
        }
    });
});

module.exports = router;