(function (ext) {
    ext.shouldContinue = true;
    var lst_update = (new Date).getTime();
    // Cleanup function when the extension is unloaded
    ext._shutdown = function () {
        //ext.shouldContinue = false;
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function () {
        console.log(lst_update + ", " + ((new Date).getTime() - lst_update));
        if ((new Date).getTime() - lst_update < 500)
            return { status: 2, msg: 'Ready!' };
        else
            return { status: 1, msg: 'Helper not responsive' };
    };

    ext.tOut = null;

    window["pxcm"] = {};
    var a = function () {
        $.getJSON("http://localhost:25456/", function (e) {
            console.log("got pxcm");
            lst_update = (new Date).getTime();
            window["pxcm"] = e;
            if ("hands" in e) {
                var rh = null, lh = null;
                for (var i = 0; i < e["hands"].length; i++) {
                    if (e["hands"][i]["side"] == "BODY_SIDE_RIGHT") {
                        rh = e["hands"][i];
                    }
                    else
                        lh = e["hands"][i];
                }
                window["right_hand"] = rh;
                window["left_hand"] = lh;
                if (e["faces"].length == 0)
                    window["face"] = null;
                else
                    window["face"] = e["faces"][0];
            }
            if (ext.shouldContinue) setTimeout(a, 100);
        }).error(function () {
            if (ext.shouldContinue) setTimeout(a, 100);
        });
    };
    a();

    ext.face_visible = function () {
        return window["face"] ? true : false;
    };

    ext.face_position_landmark = function (axis, landmarkIndex) {
        if (!window["face"]) return 0;
        return window["face"]["landmarks"][landmarkIndex]["position"][axis == 'x' ? 0 : (axis == 'y' ? 1 : 2)];
    }

    ext.face_rotation = function (axis) {
        if (!window["face"]) return 0;
        return window["face"]["rotation"][axis == 'roll' ? 0 : (axis == 'pitch' ? 1 : 2)];
    }

    ext.face_expression = function (exp) {
        if (!window["face"]) return 0;
        return window["face"]["expressions"][exp];
    }

    ext.hand_visible = function (side) {
        if (side == 'any') return pxcm["hands"].length > 0;
        else if (side == 'right') return !!right_hand;
        else return !!left_hand;
    }

    ext.hand_position = function (side, axis) {
        var handObj;
        if (side == "any") handObj = right_hand || left_hand;
        else if (side == "right") handObj = right_hand;
        else handObj = left_hand;
        if (!handObj) return 0;
        return handObj["position"][axis == 'x' ? 0 : (axis == 'y' ? 1 : 2)];
    }

    ext.hand_joint_position = function (side, jnt, axis) {
        var handObj;
        if (side == "any") handObj = (right_hand || left_hand)["joints"][jnt];
        else if (side == "right") handObj = right_hand["joints"][jnt];
        else handObj = left_hand["joints"][jnt];
        if (!handObj) return 0;
        return handObj["position"][axis == 'x' ? 0 : (axis == 'y' ? 1 : 2)];
    }

    ext.hand_gesture = function (side, gest) {
        var handObj;
        if (side == "any") handObj = right_hand || left_hand;
        else if (side == "right") handObj = right_hand;
        else handObj = left_hand;
        if (!handObj) return false;
        if (gest == handObj["gesture"]) return true;
        return false;
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            ['b', 'face visible?', 'face_visible'],
            ['r', '%m.axis position of face %n', 'face_position_landmark', 'x', '0'],
            ['r', '%m.angle rotation of face', 'face_rotation', 'roll'],
            ['r', 'face expression %m.expression', 'face_expression', 'EXPRESSION_BROW_LOWERER_LEFT'],
            ['-'], ['-'],
            ['b', '%m.body_side hand visible', 'hand_visible', 'right'],
            ['r', '%m.body_side hand position %m.axis', 'hand_position', 'right', 'x'],
            ['r', '%m.body_side hand joint %n position %m.axis', 'hand_joint_position', 'right', '0', 'x'],
            ['b', '%m.body_side hand gesture %m.gesture', 'hand_gesture', 'right', 'spreadfingers']
        ],
        menus: {
            'body_side': ['left', 'right', 'any'],
            'axis': ['x', 'y', 'z'],
            'angle': ['roll', 'pitch', 'yaw'],
            'gesture': ['spreadfingers', 'v_sign', 'thumb_up', 'thumb_down', 'full_pinch', 'two_finger_pinch_open', 'wave', 'tap', 'swipe'],
            'expression': ['EXPRESSION_BROW_LOWERER_LEFT', 'EXPRESSION_BROW_LOWERER_RIGHT', 'EXPRESSION_BROW_RAISER_LEFT', 'EXPRESSION_BROW_RAISER_RIGHT', 'EXPRESSION_EYES_CLOSED_LEFT', 'EXPRESSION_EYES_CLOSED_RIGHT', 'EXPRESSION_EYES_DOWN', 'EXPRESSION_EYES_TURN_LEFT', 'EXPRESSION_EYES_TURN_RIGHT', 'EXPRESSION_EYES_UP', 'EXPRESSION_HEAD_DOWN', 'EXPRESSION_HEAD_TILT_LEFT', 'EXPRESSION_HEAD_TILT_RIGHT', 'EXPRESSION_HEAD_TURN_LEFT', 'EXPRESSION_HEAD_TURN_RIGHT', 'EXPRESSION_HEAD_UP', 'EXPRESSION_KISS', 'EXPRESSION_MOUTH_OPEN', 'EXPRESSION_PUFF_LEFT', 'EXPRESSION_PUFF_RIGHT', 'EXPRESSION_SMILE', 'EXPRESSION_TONGUE_OUT']
        }
    };

    // Register the extension
    ScratchExtensions.register('RealScratch', descriptor, ext);
})({});