"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const squel_1 = __importDefault(require("squel"));
const fs_1 = __importDefault(require("fs"));
//@ts-ignore
const sql_formatter_1 = require("sql-formatter");
const Param = process.argv[2];
const FileContents = fs_1.default.readFileSync(Param).toString();
const FileJSON = JSON.parse(FileContents);
class sqlDefault {
    val = "default";
    constructor() {
        this.val = "default";
    }
}
squel_1.default.registerValueHandler(sqlDefault, function (obj) {
    return obj.val;
});
function main() {
    const Modifiers = FileJSON.Modifiers;
    let modifiersQuery = squel_1.default.insert().into("Modifiers");
    let dynamicModifiersQuery = squel_1.default.insert().into("DynamicModifiers");
    let modifierArgQuery = squel_1.default.insert().into("ModifierArguments");
    let reqSetsQuery = squel_1.default.insert().into("RequirementSets");
    let reqSetReqsQuery = squel_1.default.insert().into("RequirementSetRequirements");
    let reqArgQuery = squel_1.default.insert().into("RequirementArguments");
    let reqsQuery = squel_1.default.insert().into("Requirements");
    let typesQuery = squel_1.default.insert().into("Types");
    let modifiers = [];
    let reqs = [];
    let modifierTypes = [];
    let modifierArgs = [];
    let reqArgs = [];
    let reqSets = [];
    let reqSetReqs = [];
    let types = [];
    let connections = {};
    let connectionQueries = [];
    let finalStr = "";
    for (let i = 0; i < Modifiers.length; i++) {
        const Modifier = Modifiers[i];
        let modifierType;
        let subjectRequirementSetId = undefined;
        let ownerRequirementSetId = undefined;
        if (Modifier.ModifierType) {
            modifierType = Modifier.ModifierType;
        }
        else if (Modifier.EffectType && Modifier.CollectionType) {
            modifierType = `MODTYPE_${Modifier.ModifierId}`;
            modifierTypes.push({
                ModifierType: modifierType,
                CollectionType: Modifier.CollectionType,
                EffectType: Modifier.EffectType
            });
            types.push({
                Type: modifierType,
                Kind: "KIND_MODIFIER"
            });
        }
        else {
            console.error("Missing ModifierType, EffectType, or CollectionType");
            return;
        }
        if (Modifier.Arguments) {
            modifierArgs = getArguments(Modifier.ModifierId, modifierArgs, Modifier.Arguments, "mod");
        }
        if (Modifier.SubjectRequirementSetId) {
            subjectRequirementSetId = Modifier.SubjectRequirementSetId;
        }
        else if (Modifier.SubjectRequirementSet) {
            subjectRequirementSetId = `REQSET_${Modifier.ModifierId}`;
            reqSets.push({
                RequirementSetId: subjectRequirementSetId,
                RequirementSetType: Modifier.SubjectRequirementSet.RequirementSetType
            });
            for (let j = 0; j < Modifier.SubjectRequirementSet.Requirements.length; j++) {
                const Req = Modifier.SubjectRequirementSet.Requirements[j];
                const RequirementId = `REQ_${Modifier.ModifierId}_${j}`;
                reqSetReqs.push({
                    RequirementSetId: subjectRequirementSetId,
                    RequirementId: RequirementId
                });
                if (Req.Arguments) {
                    reqArgs = getArguments(RequirementId, reqArgs, Req.Arguments, "req");
                }
                reqs.push({
                    RequirementId: RequirementId,
                    RequirementType: Req.RequirementType,
                    ...(Req.Likeliness) && { Likeliness: Req.Likeliness },
                    ...(Req.Impact) && { Impact: 1 },
                    ...(Req.Inverse) && { Inverse: 1 },
                    ...(Req.Reverse) && { Reverse: 1 },
                    ...(Req.Persistent) && { Persistent: 1 },
                    ...(Req.ProgressWeight) && { ProgressWeight: 1 },
                    ...(Req.Triggered) && { Triggered: 1 }
                });
            }
        }
        if (Modifier.OwnerRequirementSetId) {
            ownerRequirementSetId = Modifier.OwnerRequirementSetId;
        }
        else if (Modifier.OwnerRequirementSet) {
            ownerRequirementSetId = `REQSET_${Modifier.ModifierId}`;
            reqSets.push({
                RequirementSetId: ownerRequirementSetId,
                RequirementSetType: Modifier.OwnerRequirementSet.RequirementSetType
            });
            for (let j = 0; j < Modifier.OwnerRequirementSet.Requirements.length; j++) {
                const Req = Modifier.OwnerRequirementSet.Requirements[j];
                const RequirementId = `REQ_${Modifier.ModifierId}_${j}`;
                reqSetReqs.push({
                    RequirementSetId: ownerRequirementSetId,
                    RequirementId: RequirementId
                });
                if (Req.Arguments) {
                    reqArgs = getArguments(RequirementId, reqArgs, Req.Arguments, "req");
                }
                reqs.push({
                    RequirementId: RequirementId,
                    RequirementType: Req.RequirementType,
                    ...(Req.Likeliness) && { Likeliness: Req.Likeliness },
                    ...(Req.Impact) && { Impact: 1 },
                    ...(Req.Inverse) && { Inverse: 1 },
                    ...(Req.Reverse) && { Reverse: 1 },
                    ...(Req.Persistent) && { Persistent: 1 },
                    ...(Req.ProgressWeight) && { ProgressWeight: 1 },
                    ...(Req.Triggered) && { Triggered: 1 }
                });
            }
        }
        if (Modifier.Connections) {
            for (const [tableName, columns] of Object.entries(Modifier.Connections)) {
                connections[tableName] = [];
                let connection = {
                    ModifierId: Modifier.ModifierId
                };
                for (const [columnName, value] of Object.entries(columns)) {
                    connection[columnName] = value;
                }
                connections[tableName].push(connection);
            }
        }
        modifiers.push({
            ModifierId: Modifier.ModifierId,
            ModifierType: modifierType,
            ...(Modifier.RunOnce) && { RunOnce: 1 },
            ...(Modifier.NewOnly) && { NewOnly: 1 },
            ...(Modifier.Permanent) && { Permanent: 1 },
            ...(Modifier.Repeatable) && { Repeatable: 1 },
            ...(Modifier.OwnerStackLimit) && { OwnerStackLimit: Modifier.OwnerStackLimit },
            ...(Modifier.SubjectStackLimit) && { SubjectStackLimit: Modifier.SubjectStackLimit },
            ...(ownerRequirementSetId) && { OwnerRequirementSetId: ownerRequirementSetId },
            ...(subjectRequirementSetId) && { SubjectRequirementSetId: subjectRequirementSetId }
        });
    }
    for (const [tableName, columnSets] of Object.entries(connections)) {
        finalStr += `${squel_1.default.insert().into(tableName).setFieldsRows(columnSets)};\n`;
    }
    modifiersQuery = modifiersQuery.setFieldsRows(modifiers);
    dynamicModifiersQuery = dynamicModifiersQuery.setFieldsRows(modifierTypes);
    modifierArgQuery = modifierArgQuery.setFieldsRows(modifierArgs);
    reqArgQuery = reqArgQuery.setFieldsRows(reqArgs);
    reqsQuery = reqsQuery.setFieldsRows(reqs);
    reqSetsQuery = reqSetsQuery.setFieldsRows(reqSets);
    reqSetReqsQuery = reqSetReqsQuery.setFieldsRows(reqSetReqs);
    typesQuery = typesQuery.setFieldsRows(types);
    finalStr += `${modifiersQuery};\n${dynamicModifiersQuery};\n${typesQuery};\n${modifierArgQuery};\n` +
        `${reqSetsQuery};\n${reqSetReqsQuery};\n${reqArgQuery};\n${reqsQuery};\n`;
    fs_1.default.writeFileSync("./output.sql", (0, sql_formatter_1.format)(finalStr));
}
function getArguments(Id, queries, args, type) {
    for (const [arg, details] of Object.entries(args)) {
        if (type === "mod") {
            queries.push({
                ModifierId: Id,
                Name: arg,
                Value: details.Value,
                ...(details.Type) && { Type: details.Type },
                ...(details.Extra) && { Extra: details.Extra },
                ...(details.SecondExtra) && { SecondExtra: details.SecondExtra }
            });
        }
        else if (type === "req") {
            queries.push({
                RequirementId: Id,
                Name: arg,
                Value: details.Value,
                Type: details.Type ? details.Type : new sqlDefault(),
                ...(details.Extra) && { Extra: details.Extra },
                ...(details.SecondExtra) && { SecondExtra: details.SecondExtra }
            });
        }
    }
    return queries;
}
main();
