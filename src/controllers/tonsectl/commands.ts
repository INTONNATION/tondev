import {
    Command,
    Terminal,
} from "../../core";


import {components} from "./components";
import {downloadBinaryFromGithub, tonsectlHomeBinary, TONSECTLRegistry} from "./registry";
import {tonsectlHome} from "./registry"
import fs from "fs";

export const tonsectlSetCommand: Command = {
    name: "set",
    title: "Update SE Config",
    args: [
        {
            name: "version",
            title: "TONSECTL version (Look available with version command )",
            type: "string",
            defaultValue: "0.28.6",


        },
        {
            name: "port",
            title: "TONSECTL version (Look available with version command )",
            type: "string",
            defaultValue: "80",


        },
        {
            name: "db_port",
            title: "ArangoDB port",
            type: "string",
            defaultValue: "8529",


        },
        ],
    async run(terminal: Terminal,  args: {
        version: string,
        port: string,
        db_port: string,
    }): Promise<void> {
        const registry = new TONSECTLRegistry();
        await registry.setupConfig(terminal,args.version,args.port);
        var version = await registry.getVersion(terminal)
        var os = await registry.getOS();
        var port = await registry.getPort()
        var db_port = await registry.getDBPort()
        const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${version}/tonsectl_${os}`;
        await downloadBinaryFromGithub(terminal,url,tonsectlHome())
        await components.tonsectl.run(terminal,"./", ["stop"])
        await components.tonsectl.run(terminal,"./", [`install`,`${port}`,`${db_port}`])
        await components.tonsectl.run(terminal,"./", ["start"])
    },

};

export const tonsectlUpdateCommand: Command = {
    name: "update",
    title: "Update SE version",
    args: [],
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["stop"])
        const registry = new TONSECTLRegistry();
        var tonsectl_current_version = await registry.getVersion(terminal);
        var tonsectl_latest_version = await registry.getLatestVersion();
        var os = await registry.getOS();
        var port = await registry.getPort()
        if (tonsectl_current_version !== tonsectl_latest_version){
            const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${tonsectl_latest_version}/tonsectl_${os}`;
            await downloadBinaryFromGithub(terminal,url,tonsectlHome())
            await components.tonsectl.run(terminal,"./", ["install",`${port}`])
            await registry.setupConfig(terminal,String(tonsectl_latest_version))
            terminal.log("The latest version of TONSECTL was installed")
            await components.tonsectl.run(terminal,"./", ["stop"])
        }else{
            terminal.log("Your version is latest")
        }
    }
};

export const tonsectlVersionCommand: Command = {
    name: "version",
    title: "Show SE Versions",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const registry = new TONSECTLRegistry();
        const versions = await registry.getVersions();
        terminal.log(`InstalledVersion: ${(await registry.getVersion(terminal))}\nVersions from Github: ${versions}`);
    },
};

export const tonsectlStartCommand: Command = {
    name: "start",
    title: "Start SE",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const registry = new TONSECTLRegistry();
        var version = await registry.getVersion(terminal)
        if (!fs.existsSync(tonsectlHomeBinary())) {
            var port = await registry.getPort()
            var os = await registry.getOS();
            const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${version}/tonsectl_${os}`;
            await downloadBinaryFromGithub(terminal, url, tonsectlHome())
        }
        var tonsectl_version = await components.tonsectl.run(terminal, "./", ["version"])
        if (String(version) !== String(tonsectl_version)) {
                         var port = await registry.getPort()
                         var os = await registry.getOS();
                         const url = `https://github.com/INTONNATION/tonos-se-installers/releases/download/${version}/tonsectl_${os}`;
                         await downloadBinaryFromGithub(terminal, url, tonsectlHome())
                         await components.tonsectl.run(terminal, "./", [`install`, `${port}`])
            }
        await components.tonsectl.run(terminal,"./", ["start"])
    },
};

export const tonsectlinfoCommand: Command = {
    name: "info",
    title: "Show SE Info",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        const registry = new TONSECTLRegistry();
        const tonsectl_version = await registry.getVersion(terminal);
        terminal.log(`Current port: ${(await registry.getPort())}\nCurrent version: ${tonsectl_version}`);
        await components.tonsectl.run(terminal,"./", ["status"])
    },
};

export const tonsectlStopCommand: Command = {
    name: "stop",
    title: "Stop SE",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["stop"])
    },
};

export const tonsectlResetCommand: Command = {
    name: "reset",
    title: "Reset SE, clear blockchain data",
    async run(terminal: Terminal, _args: {}): Promise<void> {
        await components.tonsectl.run(terminal,"./", ["reset"])
    },
};
