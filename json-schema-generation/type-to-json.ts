import * as TJS from "typescript-json-schema";
import { resolve } from "path";
import { writeFileSync } from "fs";

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
    required: true
};

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
    
};

const program = TJS.getProgramFromFiles(
    [resolve("json-schema-generation/type.d.ts")],
    compilerOptions
);

const schema = TJS.generateSchema(program, "ModifierMaker", settings);

writeFileSync("output.json", JSON.stringify(schema));