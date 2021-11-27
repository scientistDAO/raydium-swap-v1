"use strict";
var _a;
exports.__esModule = true;
exports.Parser = exports.TYPE_TO_LENGTH = exports.FieldType = void 0;
var FieldType;
(function (FieldType) {
    FieldType[FieldType["u8"] = 0] = "u8";
    FieldType[FieldType["u32"] = 1] = "u32";
    FieldType[FieldType["u64"] = 2] = "u64";
    FieldType[FieldType["f64"] = 3] = "f64";
})(FieldType = exports.FieldType || (exports.FieldType = {}));
exports.TYPE_TO_LENGTH = (_a = {},
    _a[FieldType.u8] = 1,
    _a[FieldType.u32] = 4,
    _a[FieldType.u64] = 8,
    _a[FieldType.f64] = 8,
    _a);
var FieldDecl = /** @class */ (function () {
    function FieldDecl(name, type) {
        this.name = name;
        this.type = type;
    }
    FieldDecl.prototype.getLength = function () {
        return exports.TYPE_TO_LENGTH[this.type];
    };
    return FieldDecl;
}());
var Parser = /** @class */ (function () {
    function Parser(fields) {
        if (fields === void 0) { fields = []; }
        this.fields = [];
        this.nameToField = {};
        fields.forEach(this.addField);
    }
    Parser.prototype.addField = function (field) {
        if (field.name in this.nameToField) {
            throw new Error(field.name + " already present in struct");
        }
        this.fields.push(field);
        this.nameToField[field.name] = field;
    };
    Parser.prototype.u8 = function (name) {
        this.addField(new FieldDecl(name, FieldType.u8));
        return this;
    };
    Parser.prototype.u32 = function (name) {
        this.addField(new FieldDecl(name, FieldType.u32));
        return this;
    };
    Parser.prototype.u64 = function (name) {
        this.addField(new FieldDecl(name, FieldType.u64));
        return this;
    };
    Parser.prototype.f64 = function (name) {
        this.addField(new FieldDecl(name, FieldType.f64));
        return this;
    };
    Parser.prototype.getLength = function () {
        return this.fields.map(function (f) { return f.getLength(); }).reduce(function (a, b) { return a + b; }, 0);
    };
    Parser.prototype.encode = function (object) {
        var buffer = Buffer.alloc(this.getLength());
        //const view = new DataView(buffer);
        var offset = 0;
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            if (!(field.name in object)) {
                throw new Error("Object does not contain " + field.name);
            }
            var value = object[field.name];
            if (field.type === FieldType.u8) {
                buffer.writeUInt8(value, offset);
                //view.setUint8(offset, value);
            }
            else if (field.type === FieldType.u32) {
                buffer.writeUInt32LE(value, offset);
                //view.setUint32(offset, value, true);
            }
            else if (field.type === FieldType.u64) {
                buffer.writeUInt32LE(value % 4294967296, offset);
                buffer.writeUInt32LE(value / 4294967296, offset + 4);
            }
            else if (field.type === FieldType.f64) {
                buffer.writeDoubleLE(value, offset);
            }
            else {
                throw new Error("Unknown field type " + field.type);
            }
            offset += field.getLength();
        }
        return buffer;
    };
    return Parser;
}());
exports.Parser = Parser;
