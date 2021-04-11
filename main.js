var player1 = { name: '', maxhp: 500, hp: 0, status: 0, qilv: 0 };
var player2 = { name: '', maxhp: 500, hp: 0, status: 0, qilv: 0 };
var logContent;
var turn;

var battle = () => {
    player1.name = document.getElementById('player1_name').value;
    player2.name = document.getElementById('player2_name').value;
    if (!player1.name && !player1.name.trim()) {
        alert('请输入选手1的名字(不可为空)');
        return;
    }
    if (!player2.name && !player2.name.trim()) {
        alert('请输入选手2的名字(不可为空)');
        return;
    }
    startMisson();
}

var startMisson = () => {
    // hide prepare, show battle page
    // document.getElementById('mission_prepare').hidden = true;
    // document.getElementById('misson_process').hidden = false;

    // start
    $('.log_info').empty();
    initial();
    log(null, `开始战斗！`);

    turn = Math.random() < 0.5 ? 0 : 1;
    log(null, `先手决定：1D2 = ${turn+1}，由${turn === 0 ? player1.name : player2.name}先攻！`);
    let totalTurns = 0;
    let battleInterval = setInterval(() => {
        if (player1.hp <= 0 || player2.hp <= 0) {
            clearInterval(battleInterval);
        } else {
            let player = [player1, player2][turn];
            let agaist = [player1, player2][1-turn];
            let enableSkills = skills.filter(s => {
                return s.reqStats === undefined || s.reqStats.includes(player.status)
                        && s.reqQi === undefined || s.reqQi <= player.qilv;
            });
            let skill = enableSkills[Math.floor(Math.random() * enableSkills.length)];
    
            if (skill.wudi) {
                player.wudi = true;
            }
            player.status = skill.nextStat;
    
            let mingzhong = !agaist.wudi;
            if (skill.qiChange && (skill.qiChange < 0 || mingzhong)) {
                player.qilv += skill.qiChange;
            }
            if (player.qilv < 0) {
                player.qilv = 0;
            }

            let msg = `使用了${skill.name}`;
            let dmg = skill.dmg;
            if (isNaN(dmg)) {
                dmg = dmg(player.qilv);
            }
            
            if (mingzhong) {
                if (dmg > 0) {
                    msg += `，造成了${dmg}点伤害。`;
                    agaist.hp -= dmg;
                    if (agaist.hp < 0) {
                        agaist.hp = 0;
                    }
                }
    
            } else {
                if (dmg > 0) {
                    msg += `，但没有命中！`;
                }
                agaist.wudi = false;
            }
            log(player, msg);
    
            turn = 1 - turn;
            totalTurns++;
            renderUI();
        }
    }, 500);    
}

var initial = () => {
    $(`.player1_info .name`).text(player1.name);
    $(`.player2_info .name`).text(player2.name);

    // health point
    player1.hp = player1.maxhp;
    player2.hp = player1.maxhp;

    // 气刃等级
    player1.qilv = 0;
    player2.qilv = 0;

    // 状态; 0: 收刀态, 1: 自由态, 2: 连携态, 3: 纳刀态;
    player1.status = 0;
    player2.status = 0;

    // pick up arms
    player1.arm = getArm();
    log(player1, `使用了武器:${player1.arm}`);
    player2.arm = getArm();
    log(player2, `使用了武器:${player2.arm}`);
}

var log = (sender, msg) => {
    if (!logContent) {
        logContent = document.getElementsByClassName('log_info')[0];
    }
    let msgSpan = $(`<div></div>`);
    let namesp;
    switch(sender) {
        case player1:
            namesp = `<span style="color: red; font-weight: bold;">${player1.name}</span>`;
            msgSpan.append(namesp);
            break;
        case player2:
            namesp = `<span style="color: blue; font-weight: bold;">${player2.name}</span>`;
            msgSpan.append(namesp);
            break;
        default:
            break;
    }
    msgSpan.append(`<span>${msg}</span>`);
    $(logContent).append(msgSpan);
    msgSpan.get(0).scrollIntoView();
}

var renderUI = () => {
    $('.player1_info .name').text(player1.name);
    $('.player1_info .rest_hp').css('width', player1.hp * 100 / player1.maxhp + '%');
    $('.player1_info .qi').attr('qilv', player1.qilv);

    $('.player2_info .name').text(player2.name);
    $('.player2_info .rest_hp').css('width', player2.hp * 100 / player2.maxhp + '%');
    $('.player2_info .qi').attr('qilv', player2.qilv);
}

var getArm = () => {
    return '太刀';
}

var skills = [
    { name: '踏步斩', dmg: 20, reqStats: [0], nextStat: 2, },
    { name: '突刺', dmg: 10, reqStats: [1, 2], nextStat: 2, },
    { name: '上挑', dmg: 10, reqStats: [1, 2], nextStat: 2, },
    { name: '气刃大回旋', dmg: 10, reqStats: [1, 2], qiChange: 1, nextStat: 2, },

    { name: '见切', wudi: true, dmg: 0, reqStats: [2], nextStat: 2, },

    { name: '特殊纳刀', wudi: true, dmg: 0, reqStats: [2], nextStat: 3, },
    { name: '居合拔刀气刃斩', dmg: 50, reqStats: [3], qiChange: 1, nextStat: 2, },

    { name: '气刃兜割', dmg: (qi) => 50 * qi, reqStats: [3], reqQi: 1, qiChange: -1, nextStat: 2 },
];