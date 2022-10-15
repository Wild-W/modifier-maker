import squel, { Insert, Squel } from "squel";
import fs from "fs";
//@ts-ignore
import { format } from "sql-formatter";

type JSONSchema = {
    Modifiers: {
        ModifierId: string,
        ModifierType: string,
        RunOnce: boolean,
        NewOnly: boolean,
        Permanent: boolean,
        Repeatable: boolean,
        OwnerStackLimit: number,
        SubjectStackLimit: number,
        OwnerRequirementSetId: string,
        SubjectRequirementSetId: string,
        CollectionType: string,
        EffectType: string,
        Arguments: modArgs,
        SubjectRequirementSet: {
            RequirementSetType: string,
            Requirements: modReqs
        }
        OwnerRequirementSet: {
            RequirementSetType: string,
            Requirements: modReqs
        }
        Connections: {
            PoliciyModifiers: {
                PolicyType: string
            }
        }
    }[]
}
type modArgs = Record<string, {
    Value: any,
    Type: string
}>
type arg = {
    ModifierId?: string,
    RequirementId?: string,
    Name: string,
    Value: string,
    Type?: string,
    Extra?: string,
    SecondExtra?: string
}
type modReqs = {
    RequirementType: string,
    Likeliness: number,
    Impact: boolean, 
    Inverse: boolean,
    Reverse: boolean,
    Persistent: boolean,
    ProgressWeight: boolean,
    Triggered: boolean,
    Arguments: modArgs
}[]
type req = {
    RequirementId: string,
    RequirementType: string,
    Likeliness?: number,
    Impact?: number,
    Inverse?: number,
    Reverse?: number,
    Persistent?: number,
    ProgressWeight?: number,
    Triggered?: number
}

const Param: string = process.argv[2];
const FileContents: string = fs.readFileSync(Param).toString();
const FileJSON: JSONSchema = JSON.parse(FileContents);

function main()
{
    const Modifiers = FileJSON.Modifiers;

    let modifiersQuery = squel.insert().into("Modifiers");
    let dynamicModifiersQuery = squel.insert().into("DynamicModifiers");
    let modifierArgQuery = squel.insert().into("ModifierArguments");
    let reqSetsQuery = squel.insert().into("RequirementSets");
    let reqSetReqsQuery = squel.insert().into("RequirementSetRequirements");
    let reqArgQuery = squel.insert().into("RequirementArguments");
    let reqsQuery = squel.insert().into("Requirements");
    let typesQuery = squel.insert().into("Types");

    let modifiers: {
        ModifierId: string,
        ModifierType: string,
        RunOnce?: number,
        NewOnly?: number,
        Permanent?: number,
        Repeatable?: number,
        OwnerStackLimit?: number,
        SubjectStackLimit?: number,
        OwnerRequirementSetId?: string,
        SubjectRequirementSetId?: string
    }[] = [];
    let reqs: req[] = [];
    let modifierTypes: {
        ModifierType: string,
        CollectionType: string,
        EffectType: string
    }[] = [];
    let modifierArgs: arg[] = [];
    let reqArgs: arg[] = [];
    let reqSets: {
        RequirementSetId: string,
        RequirementSetType: string
    }[] = [];
    let reqSetReqs: {
        RequirementSetId: string,
        RequirementId: string
    }[] = [];
    let types: {
        Type: string,
        Kind: string
    }[] = [];
    let connectionQueries: Insert[] = [];
    let finalStr: string;

    for (let i = 0; i < Modifiers.length; i++)
    {
        const Modifier = Modifiers[i];
        let modifierType: string;
        let subjectRequirementSetId: string|undefined = undefined;
        let ownerRequirementSetId: string|undefined = undefined;

        if (Modifier.ModifierType)
        {
            modifierType = Modifier.ModifierType;
        }
        else if (Modifier.EffectType && Modifier.CollectionType)
        {
            modifierType = `MODTYPE_${Modifier.ModifierId}`;
            modifierTypes.push(
                {
                    ModifierType: modifierType,
                    CollectionType: Modifier.CollectionType,
                    EffectType: Modifier.EffectType
                }
            );
            types.push(
                {
                    Type: modifierType,
                    Kind: "KIND_MODIFIER"
                }
            )
        }
        else
        {
            console.error("Missing ModifierType, EffectType, or CollectionType");
            return;
        }

        if (Modifier.Arguments)
        {
            modifierArgs = getArguments(Modifier.ModifierId, modifierArgs, Modifier.Arguments, "mod");
        }

        if (Modifier.SubjectRequirementSetId)
        {
            subjectRequirementSetId = Modifier.SubjectRequirementSetId;
        }
        else if (Modifier.SubjectRequirementSet)
        {
            subjectRequirementSetId = `REQSET_${Modifier.ModifierId}`;
            reqSets.push(
                {
                    RequirementSetId: subjectRequirementSetId,
                    RequirementSetType: Modifier.SubjectRequirementSet.RequirementSetType
                }
            );

            for (let j = 0; j < Modifier.SubjectRequirementSet.Requirements.length; j++)
            {
                const Req = Modifier.SubjectRequirementSet.Requirements[j];
                const RequirementId = `REQ_${Modifier.ModifierId}_${j}`;

                reqSetReqs.push(
                    {
                        RequirementSetId: subjectRequirementSetId,
                        RequirementId: RequirementId
                    }
                );

                if (Req.Arguments)
                {
                    reqArgs = getArguments(RequirementId, reqArgs, Req.Arguments, "req");
                }
                
                reqs.push(
                    {
                        RequirementId: RequirementId,
                        RequirementType: Req.RequirementType,
                        ...(Req.Likeliness) && {Likeliness: Req.Likeliness},
                        ...(Req.Impact) && {Impact: 1},
                        ...(Req.Inverse) && {Inverse: 1},
                        ...(Req.Reverse) && {Reverse: 1},
                        ...(Req.Persistent) && {Persistent: 1},
                        ...(Req.ProgressWeight) && {ProgressWeight: 1},
                        ...(Req.Triggered) && {Triggered: 1}
                    }
                )
            }
        }

        if (Modifier.OwnerRequirementSetId)
        {
            ownerRequirementSetId = Modifier.OwnerRequirementSetId;
        }
        else if (Modifier.OwnerRequirementSet)
        {
            ownerRequirementSetId = `REQSET_${Modifier.ModifierId}`;
            reqSets.push(
                {
                    RequirementSetId: ownerRequirementSetId,
                    RequirementSetType: Modifier.OwnerRequirementSet.RequirementSetType
                }
            );

            for (let j = 0; j < Modifier.OwnerRequirementSet.Requirements.length; j++)
            {
                const Req = Modifier.OwnerRequirementSet.Requirements[j];
                const RequirementId = `REQ_${Modifier.ModifierId}_${j}`;

                reqSetReqs.push(
                    {
                        RequirementSetId: ownerRequirementSetId,
                        RequirementId: RequirementId
                    }
                );

                if (Req.Arguments)
                {
                    reqArgs = getArguments(RequirementId, reqArgs, Req.Arguments, "req");
                }
                
                reqs.push(
                    {
                        RequirementId: RequirementId,
                        RequirementType: Req.RequirementType,
                        ...(Req.Likeliness) && {Likeliness: Req.Likeliness},
                        ...(Req.Impact) && {Impact: 1},
                        ...(Req.Inverse) && {Inverse: 1},
                        ...(Req.Reverse) && {Reverse: 1},
                        ...(Req.Persistent) && {Persistent: 1},
                        ...(Req.ProgressWeight) && {ProgressWeight: 1},
                        ...(Req.Triggered) && {Triggered: 1}
                    }
                )
            }
        }

        if (Modifier.Connections)
        {
            for (const [table, columns] of Object.entries(Modifier.Connections))
            {
                connectionQueries.push(squel.insert().into(table).setFields(columns));
            }
        }

        modifiers.push(
            {
                ModifierId: Modifier.ModifierId,
                ModifierType: modifierType,
                ...(Modifier.RunOnce) && {RunOnce: 1},
                ...(Modifier.NewOnly) && {NewOnly: 1},
                ...(Modifier.Permanent) && {Permanent: 1},
                ...(Modifier.Repeatable) && {Repeatable: 1},
                ...(Modifier.OwnerStackLimit) && {OwnerStackLimit: Modifier.OwnerStackLimit},
                ...(Modifier.SubjectStackLimit) && {SubjectStackLimit: Modifier.SubjectStackLimit},
                ...(ownerRequirementSetId) && {OwnerRequirementSetId: ownerRequirementSetId},
                ...(subjectRequirementSetId) && {SubjectRequirementSetId: subjectRequirementSetId}
            }
        )
    }

    modifiersQuery = modifiersQuery.setFieldsRows(modifiers);
    dynamicModifiersQuery = dynamicModifiersQuery.setFieldsRows(modifierTypes);
    modifierArgQuery = modifierArgQuery.setFieldsRows(modifierArgs);
    reqArgQuery = reqArgQuery.setFieldsRows(reqArgs);
    reqsQuery = reqsQuery.setFieldsRows(reqs);
    reqSetsQuery = reqSetsQuery.setFieldsRows(reqSets);
    reqSetReqsQuery = reqSetReqsQuery.setFieldsRows(reqSetReqs);
    typesQuery = typesQuery.setFieldsRows(types);

    finalStr = `${modifiersQuery};\n${dynamicModifiersQuery};\n${typesQuery};\n${modifierArgQuery};\n` +
               `${reqSetsQuery};\n${reqSetReqsQuery};\n${reqArgQuery};\n${reqsQuery};\n`;
    
    fs.writeFileSync("./output.sql", format(finalStr));
}

function getArguments(Id: string, queries: arg[], args: modArgs, type: string): arg[]
{
    for (const [arg, details] of Object.entries(args))
    {
        if (type === "mod")
        {
            queries.push(
                {
                    ModifierId: Id,
                    Name: arg,
                    Value: details.Value,
                    ...(details.Type) && {Type: details.Type}
                }
            )
        }
        else if (type === "req")
        {
            queries.push(
                {
                    RequirementId: Id,
                    Name: arg,
                    Value: details.Value,
                    ...(details.Type) && {Type: details.Type}
                }
            )
        }
    }
    return queries;
}

main();