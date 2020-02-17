import { Command, flags } from '@oclif/command';
export default class Test extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        coverage: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        debug: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        watch: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        runInBand: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        passthrough: flags.IOptionFlag<string[]>;
    };
    run(): Promise<void>;
}
