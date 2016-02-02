/*global describe, it*/
"use strict";

var fs = require("fs"),
    should = require("should");

require("event-stream");
require("mocha");

delete require.cache[require.resolve("../")];

const gutil = require("gulp-util"),
    tlcombine = require("../dist/index");

describe("gulp-tl-combine", ()=> {
    const expectedFile = new gutil.File({
            path: "test/expected/output.json",
            cwd: "test/",
            base: "test/expected",
            contents: fs.readFileSync("test/expected/output.json")
        }),
        sourceFiles = [
            new gutil.File({
                path: "test/fixtures/queries/query.n1ql",
                cwd: "test/",
                base: "test",
                contents: fs.readFileSync("test/fixtures/queries/query.n1ql")
            }),
            new gutil.File({
                path: "test/fixtures/entities/case.json",
                cwd: "test/",
                base: "test",
                contents: fs.readFileSync("test/fixtures/entities/case.json")
            })
        ];

    it("should produce expected file via buffer", function (done) {
        var stream = tlcombine("output.json");

        stream.on("data", (newFile)=> {
            should.exist(newFile);
            should.exist(newFile.contents);

            String(newFile.contents).should.equal(String(expectedFile.contents));
            done();
        });

        stream.write(sourceFiles[0]);
        stream.write(sourceFiles[1]);

        stream.end();
    });

    it("should error on stream", function (done) {
        var srcFile = new gutil.File({
            path: "test/fixtures/queries/query.n1ql",
            cwd: "test/",
            base: "test/fixtures",
            contents: fs.createReadStream("test/fixtures/queries/query.n1ql")
        });

        var stream = tlcombine("output.json");

        stream.on("error", (err)=> {
            err.message.should.equal("Streaming not supported");
            done();
        });

        stream.on("data", ()=> {
            should.fail(null, null, "should never get here");
        });

        stream.write(srcFile);
        stream.end();
    });
});
