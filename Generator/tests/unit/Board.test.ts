import {Board} from '../../Board';
import { CustomError, CustomErrorEnum } from '../../CustomError';
import { StrategyEnum } from '../../Sudoku';
import { getError } from '../testResources';

enum TestBoards {
    SINGLE_NAKED_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329",
    SINGLE_NAKED_SINGLE_SOLUTION = "439275618251896437876143592342687951185329746697451283928734165563912874714568329",
    ONLY_NAKED_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500",
    ONLY_NAKED_SINGLES_SOLUTION = "316984752298157346574623819423718695765439128189562437851396274637245981942871563",
    ROW_HIDDEN_SINGLES = "603002001500000020901730006810400090060000000000690040350000004002070005000500108",
    ROW_HIDDEN_SINGLES_SOLUTION = "683942751574816329921735486817453692469287513235691847358169274142378965796524138",
    ROW_COLUMN_BOX_HIDDEN_SINGLES = "902100860075000001001080000600300048054809600108060900500401000000050002089000050",
    ROW_COLUMN_BOX_HIDDEN_SINGLES_SOLUTION = "942137865875946231361285479697312548254879613138564927523491786416758392789623154",
    ROW_NAKED_PAIR = "249871000387625419165493827936584271718362900452917386870206190520109008691748502",
    ROW_NAKED_PAIR_SOLUTION = "249871653387625419165493827936584271718362945452917386873256194524139768691748532",
    COLUMN_NAKED_PAIR = "030000506000098071000000490009800000002010000380400609800030960100000004560982030",
    COLUMN_NAKED_PAIR_SOLUTION = "938741526456298371271365498619853742742619853385427619827134965193576284564982137",
    BOX_NAKED_PAIR = "700000006000320900000000054205060070197400560060000000010000000000095401630100020",
    BOX_NAKED_PAIR_SOLUTION = "783549216451326987926817354245961873197438562368752149514273698872695431639184725",
    NAKED_TRIPLET = "070408029002000004854020007008374200020000000003261700000093612200000403130642070",
    NAKED_TRIPLET_SOLUTION = "671438529392715864854926137518374296726859341943261785487593612269187453135642978",
    NAKED_OCTUPLET = "390000500000050832008316970080030000639702010007000009070045098000690040000000000",
    NAKED_OCTUPLET_SOLUTION = "394827561761459832528316974485931726639782415217564389173245698852693147946178253",
    POINTING_PAIR = "009070000080400000003000028100000670020013040040007800600030000010000000000000284",
    MULTIPLE_SOLUTIONS = "023070000056002301089000000000007080517000006000400000271009005095000000000020000"
}

enum InvalidTestBoards {
    DUPLICATE_VALUE_IN_COLUMN = "310084002300150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_VALUE_IN_ROW = "330084002200150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_VALUE_IN_BOX = "310084002200150006570803010423708095760030000009562030050006070007000900000001500",
}

enum DuplicateColumnValues {
    DUPLICATE_THREE_IN_FIRST_COLUMN = "310084002200150006570003010423708095760030000009562030350006070007000900000001500",
    DUPLICATE_ONE_IN_SECOND_COLUMN = "310084002200150006570003010423708095760030000019562030050006070007000900000001500",
    DUPLICATE_NINE_IN_THIRD_COLUMN = "310084002200150006570003010423708095760030000009562030050006070007000900009001500",
    DUPLICATE_SEVEN_IN_FORTH_COLUMN = "310784002200150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SIX_IN_FIFTH_COLUMN = "310084002200150006570063010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_ONE_IN_SIXTH_COLUMN = "310084002200150006570003010423708095760030000009562030050006070007001900000001500",
    DUPLICATE_NINE_IN_SEVENTH_COLUMN = "310084002200150906570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SEVEN_IN_EIGHTH_COLUMN = "310084002200150006570003010423708095060030070009562030050006070007000900000001500",
    DUPLICATE_VALUE_IN_NINTH_COLUMN = "310084002200150006570003010423708095760030000009562030050006070007000902000001500"
}

enum DuplicateRowValues {
    DUPLICATE_THREE_IN_FIRST_ROW = "310384002200150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_TWO_IN_SECOND_ROW = "310084002202150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SEVEN_IN_THIRD_ROW = "310084002200150006570073010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_SIX_IN_FORTH_ROW = "310084002200150006570003010423768095760030000009502330050006070007000900000001500",
    DUPLICATE_THREE_IN_FIFTH_ROW = "310084002200150006570003010423708095760030300009562030050006070007000900000001500",
    DUPLICATE_TWO_IN_SIXTH_ROW = "310084002000150006570003010423708095760030000009562230050006070007000900000001500",
    DUPLICATE_SIX_IN_SEVENTH_ROW = "310084002200150006570003010423708095760030000009562030050606070007000900000001500",
    DUPLICATE_VALUE_IN_EIGHTH_ROW = "310084002200150006570003010423708095760030000009562030050006070007000909000001500",
    DUPLICATE_VALUE_IN_NINTH_ROW = "310084002200150006570003010423708095760030000009562030050006070007000900000001550"
}

enum DuplicateBoxValues {
    DUPLICATE_THREE_IN_FIRST_BOX = "310084002230150006570003010423708095760030000009562030050006070007000900000001500",
    DUPLICATE_FIVE_IN_SECOND_BOX = "310584002200150006570003010423708095760030000009062030050006070007000900000001500",
    DUPLICATE_TWO_IN_THIRD_BOX = "310084002200150006570003210423708095760030000009562030050006070007000900000001500",
    DUPLICATE_FOUR_IN_FORTH_BOX = "310084002200150006570003010423708095764030000009562030050006070007000900000001500",
    DUPLICATE_FIVE_IN_FIFTH_BOX = "310084002200150006570003010423708095760035000009562030050006070007000900000001500",
    DUPLICATE_NINE_IN_SIXTH_BOX = "310084002200150006570003010423708095760030009009562030050006070007000900000001500",
    DUPLICATE_ONE_IN_SEVENTH_BOX = "310084002200150006570003010423708095760030000009562030051006070107000900000001500",
    DUPLICATE_SIX_IN_EIGHTH_BOX = "310084002200150006570003010423708095760030000009562030050006070007600900000001500",
    DUPLICATE_NINE_IN_NINTH_BOX = "310084002200150006570003010423708095760030000009562030050006079007000900000001500"
}

let difficultyBoards:string[] = ["003070040006002301089000000000107080517000006000400000271009005095000000000020000", "120740609400800000089003010000402001000000000040600900300020006200006000008000400", "020400000006009130000015200000080000300000500800064700014702805000001090000000000", "103000900006000001009300024000006040060007813817005002090000430000009080000020000", "000060070450700000009401060008207000010030090500009800070300200000000000002085031", "020609780050000090709050340071008000004000000060020000030001000900007020000000160", "000064089050800200080020001390000000504000008000910070030000000600080013948030020", "020700080050091007709304000000500098004010000290000040008060300000180004900000070", "120000000400009017780500034060000003000065000800070002000000400500900001300080050", "000600800450000700000001006010300500500000008800070430040090050000006902008200000", "020600000006007100000010000070005200095460000004001800040800920002074008000006003", "100060500006780300709020406200040005090000021000007030002000800640070000900400000", "100407000050030700009000000000700605530000902004090000040310000000070480860000200", "000050080000003109780000005000320008500090060000000200041006073000002050600007040", "103004000000802009080003050047060000300000025005000006900056000570000041000200000", "103007090006830700000401000000000000264000007071604008000040006007000000590000010", "000000800450000001009000004030080900800370000000526040000400070608002010007000506", "003060004050000010709000003004007300000008020801620009002000800600900200070001000", "020000008000700900000000010007009100000008056240006000005302000890004030300800560", "120040905056900000000000030000001040000000106008000020042070000000002060305094082", "023600040006000801700001000200000000530000608090500000000340075010200004000019060", "100000000000030720009600000001500000630090058500004002000270009060000170900046080", "120060080056001003000005064800500000200370450900010006090000000007000000500080700", "003000050450000007000100402910600700060042000000000080000010609001800005070009001", "000094800400207000080100000800000026000001009500009030030000752010000600000052090", "100005000000810000009360504200500000061000000840000062000170035000000100004608900", "000560070000000080780000300000470053002000000040600209004800000038005700610090000", "100000000050090003089250100060008901800000000000900064600019405010500000200300000", "003070948000009030000003025010500000002300070804020000205060381670000000000800000", "023000900056007010009050000001005000090800340800000000000060007005000004000701603", "023060704000070021000000500005407009800001600000030050500290000940603000000000400", "000000000000003102089000043004700020090000007005920301002008500000260000500400060", "023900608000000000000000401060009300008320005000070060015408090800102000090007080", "103060500006901800080000060201000000570023009030000010067000324000000000000709000", "020450900050003000700610000530000700608090250000000008002800005004000007900000010", "003406900450080070000000200800500030000000006007390010900700041005001000000030005", "103000000000002100780300006068000000940206300000408051004003070000020000002500014", "003000059000070031080000020892000000000200300000040070315029400000100007004800000", "003000804000000070700002003040206000001008600000090000018400009004070056300600000", "003096000400200000089530000060080004005700008007043000014007500000160002000300400", "003800600050001802709000004007100200030700485200000000000000700000200006975030000", "100050000400038002009000004000000061500240000090700000010002003900300007800604200", "120400000000000300080100060000001090560802430900000000007600080600018900000750100", "000805600400000000089000100090000003600000070037250000000009040500108006002670500", "120000000000900000009003004000300400000040031600078020900602100010050040005030009", "000004007050000039000360020000049200090000000074200081000025004900010000500483000", "003000000050800000709000024000000065007090800502001040000012000000000501900704030", "000005690006000200080300001002406000300000062500030700070010000010704900030500004", "000068070000930002000000006000109040930004807040000600002000090004306005300001400", "003560090400300207009000060002700000060008042500004100000000300000410600605200000", "120000050406000371080000000690100087000000006000709000801007009060000000300914000", "023000090000007820009032001530008070800000200600470180005000000318000000000560000", "020064009400000700089300000010005070200803000004200006090020030300000950000008000", "023007895450003000700000060040000602090502081000010030005736200000005000000020000", "000050700400008020000001400005070600804000030210560000000200006308000090000080050", "000008070056907000009000000065001700300000086047020500000400300500079800000000492", "000047890400300210700500060204036000060000000300900100035000000000008600002000400", "000000009406000000780500260018090073000007090500000600002030500000000080060800912", "100700080400080000009006000900058000002300004030002907200010500045000006600090000", "000904508000000000089032004074605230005000400300047000600050000012700600008000001", "100000508000070000780000001000012000000605004210830006040009000060000200302000010", "100004760400009081000100020097000000500070006032010000000000000000200407371800000", "000006470000800009700030010004100005001009000000564030300005800010008940000690000", "020045000000000030709600005800300904004008300095000001610800007000000200000009010", "000700400006010703080200005290000000001408600600000007000000500005600971007504006", "023004807400002900000300000000140020001000580560080000600700000008039700075060000", "003000400000070080000304010000601700000482030060005200040007000610008900908000020", "000006780000009000000210000500030001030005200208000400605300004000500020300900078", "103670000450000000000001000000004600090000074000020301800507400600080003001406850", "020000000000010380080305004005000020074000901900072000000107005600000809000946000", "100000400006100000709000010800360105000905004000007023004028000030090000600400050", "003400008000008000709000004905000087000010200200009300040600000000050000602001530", "120080000050000000080100204001409000030000070900010800000090008000751000500300097", "003000000056000003700025100000472030030100080594000000040000000000006000000081059", "100007800000300720780000030090070560060005000040830009970023000000000006000180000", "020060900000090200700002503507086009001400000030000000600001007005070300004000080", "120000000000008090080006502078000034004900018000807000040001070010050083000030000", "100004008400078320000500460002000000007081000010690005200000000070020600000409050", "020000085050000100089000006060001054001460907000075000300006070600500009040003000", "020000060056090081709030050000200010805000600030068000001000000000056002060000590", "100705000000810000009000504000006020600000047540000800300900060004008900900003002", "020000000450009030709002601607000005000000827000090000200005004000040006000100290", "100600805006000000089005040000029604000700002090063007360080000070000000005004208", "000000089056900010000300005040001003001000200238000071300089000000600040902040008", "000040080450100000000326100090000000000430200000902006378000060000080007010600050", "020000800400070000009004005060080090000000000000900302841003600600040070000026001", "100070008006002073000410506060134000000908001000000000200050700308000090005000000", "020000000400700000000030050001000600098040200207000000070802340000419005600003090", "000400908450090000700003000000080720005207400000000001040700200000020190690100003", "003040095006009170780001003800000050090070004040030000000060500008700310000003060", "000006070400800000000000005030405000204100800060000000007002010602010089008640003", "103080040056070130000040600030700001000069000090000250008000000302806000040010000", "003700489000010000709200000200008740000000903000100000005980004040060030000021000", "023050009400079000000001006032000000007508300040600008010000060205100040900000020", "003080700006700030009060000000900020800000095000006100570000080000029000040305600", "000004500050100083080032100000409000201000000970620000300040760007000005098200000", "120000080000730020000001300000120579060000400000500000308005007000800100500074000", "023006709400000000000100050910045602000000040000320900840060000092700004005000000", "023050090000001203700000010200000008500060000061400030040198000005004000090000300", "103400900400090020009102000000080160000503008090070040000005000012000007070000504"];

// How to iterate over enums:
// https://bobbyhadz.com/blog/typescript-iterate-enum#:~:text=To%20iterate%20over%20enums%3A%201%20Use%20the%20Object.keys,forEach%20%28%29%20method%20to%20iterate%20over%20the%20array.

describe("create Board objects", () => {
    it('should throw invalid board length error', async () => {
        const error = await getError(async () => new Board(TestBoards.SINGLE_NAKED_SINGLE + "0"));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_LENGTH);
    });

    it('should throw invalid board character error', async () => {
        const error = await getError(async () => new Board("a" + TestBoards.SINGLE_NAKED_SINGLE.substring(1)));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.INVALID_BOARD_CHARACTERS);
    });

    it('should throw board already solved error', async () => {
        const error = await getError(async () => new Board(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.BOARD_ALREADY_SOLVED);
    });

    it('should throw duplicate value in column error', async () => {
        const values:string[] = Object.values(DuplicateColumnValues);
        for (let i = 0; i < values.length; i ++){
            const error = await getError(async () => new Board(values[i]));
            expect(error).toBeInstanceOf(CustomError);
            expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN);
        }
    });

    it('should throw duplicate value in row error', async () => {
        const values:string[] = Object.values(DuplicateRowValues);
        for (let i = 0; i < values.length; i ++){
            const error = await getError(async () => new Board(values[i]));
            expect(error).toBeInstanceOf(CustomError);
            expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_ROW);
        }
    });

    it('should throw duplicate value in box error', async () => {
        const values:string[] = Object.values(DuplicateBoxValues);
        for (let i = 0; i < values.length; i ++){
            const error = await getError(async () => new Board(values[i]));
            expect(error).toBeInstanceOf(CustomError);
            expect(error).toHaveProperty('Error_Message', CustomErrorEnum.DUPLICATE_VALUE_IN_BOX);
        }
    });

    it('should throw multiple solutions error', async () => {
        const error = await getError(async () => new Board(TestBoards.MULTIPLE_SOLUTIONS));
        expect(error).toBeInstanceOf(CustomError);
        expect(error).toHaveProperty('Error_Message', CustomErrorEnum.MULTIPLE_SOLUTIONS);
    });
});

let singleNakedSingle:Board, onlyNakedSingles:Board, onlyNakedSinglesQuadruplets:Board;

describe("solve Boards", () => {
    beforeAll(() => {
        singleNakedSingle = new Board(TestBoards.SINGLE_NAKED_SINGLE);
        let nakedSingleAlgo:StrategyEnum[] = new Array();
        nakedSingleAlgo.push(StrategyEnum.AMEND_NOTES);
        nakedSingleAlgo.push(StrategyEnum.SIMPLIFY_NOTES);
        nakedSingleAlgo.push(StrategyEnum.NAKED_SINGLE);
        onlyNakedSingles = new Board(TestBoards.ONLY_NAKED_SINGLES, nakedSingleAlgo);
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUADRUPLET);
        algorithm.push(StrategyEnum.NAKED_SINGLE);
        onlyNakedSinglesQuadruplets = new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
    });

    it('should solve single naked single', () => {
        expect(singleNakedSingle.getSolutionString()).toBe(TestBoards.SINGLE_NAKED_SINGLE_SOLUTION);
        let drills:boolean[] = singleNakedSingle.getDrills();
        for (let i:StrategyEnum = (StrategyEnum.INVALID + 1); i < StrategyEnum.COUNT; i++) {
            // subtracted naked single cause it's the first strategy once amend/simplify are removed by getDrillStrategies()
            if (i === StrategyEnum.NAKED_SINGLE) {
                expect(drills[i- StrategyEnum.NAKED_SINGLE]).toBeTruthy();
            }
            else {
                expect(drills[i- StrategyEnum.NAKED_SINGLE]).toBeFalsy();
            }
        }
        for (let i:number = 0; i < StrategyEnum.COUNT; i++) {
            if (i === StrategyEnum.NAKED_SINGLE || i === StrategyEnum.AMEND_NOTES) {
                expect(singleNakedSingle.getStrategies()[i]).toBeTruthy();
            }
            else {
                expect(singleNakedSingle.getStrategies()[i]).toBeFalsy();
            }
        }
    });

    it('should solve naked singles only board', () => {
        expect(onlyNakedSingles.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        let strategies:boolean[] = onlyNakedSingles.getStrategies();
        for (let i:number = 0; i < strategies.length; i++) {
            if (i === StrategyEnum.NAKED_SINGLE || i === StrategyEnum.SIMPLIFY_NOTES || i === StrategyEnum.AMEND_NOTES) {
                expect(strategies[i]).toBeTruthy();
            }
            else {
                expect(strategies[i]).toBeFalsy();
            }
        }
    });

    it ('should solve row hidden single', () => {
        let board:Board = new Board(TestBoards.ROW_HIDDEN_SINGLES);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_HIDDEN_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.HIDDEN_SINGLE]).toBeTruthy();
    });

    it ('should solve row column box hidden singles', () => {
        let board:Board = new Board(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_COLUMN_BOX_HIDDEN_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.HIDDEN_SINGLE]).toBeTruthy();
    });

    it('should solve row naked pair', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_PAIR);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_PAIR && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ROW_NAKED_PAIR, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ROW_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    });

    it('should solve column naked pair', () => {
        let board:Board = new Board(TestBoards.COLUMN_NAKED_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    });

    it('should solve box naked pair', () => {
        let board:Board = new Board(TestBoards.BOX_NAKED_PAIR);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.BOX_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_PAIR]).toBeTruthy();
    });

    it('should solve naked triplet', () => {
        let board:Board = new Board(TestBoards.NAKED_TRIPLET);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.NAKED_TRIPLET_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_TRIPLET]).toBeTruthy();
    });

    it('should solve naked quadruplet', () => {
        let strategies:boolean[] = onlyNakedSinglesQuadruplets.getStrategies();
        expect(onlyNakedSinglesQuadruplets.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_QUADRUPLET]).toBeTruthy();
    });

    it('should solve naked quintuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.NAKED_QUINTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_QUINTUPLET && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_QUINTUPLET]).toBeTruthy();
    });

    it('should solve naked sextuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_SEXTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_SEXTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.ONLY_NAKED_SINGLES, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.ONLY_NAKED_SINGLES_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_SEXTUPLET]).toBeTruthy();
    });

    it('should solve naked septuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_SEPTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_SEPTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.COLUMN_NAKED_PAIR, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.COLUMN_NAKED_PAIR_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_SEPTUPLET]).toBeTruthy();
    });

    it('should solve naked octuplet', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.SIMPLIFY_NOTES);
        algorithm.push(StrategyEnum.NAKED_OCTUPLET);
        for (let strategy: number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.NAKED_OCTUPLET && strategy !== StrategyEnum.SIMPLIFY_NOTES && strategy !== StrategyEnum.AMEND_NOTES) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.NAKED_OCTUPLET, algorithm);
        let strategies:boolean[] = board.getStrategies();
        expect(board.getSolutionString()).toBe(TestBoards.NAKED_OCTUPLET_SOLUTION);
        expect(strategies[StrategyEnum.NAKED_OCTUPLET]).toBeTruthy();
    });

    it('should solve pointing pair', () => {
        let algorithm:StrategyEnum[] = new Array();
        algorithm.push(StrategyEnum.AMEND_NOTES);
        algorithm.push(StrategyEnum.POINTING_PAIR);
        for (let strategy:number = 0; strategy < StrategyEnum.COUNT; strategy++) {
            if (strategy !== StrategyEnum.AMEND_NOTES && strategy !== StrategyEnum.POINTING_PAIR) {
                algorithm.push(strategy);
            }
        }
        let board:Board = new Board(TestBoards.POINTING_PAIR, algorithm);
        let stategies:boolean[] = board.getStrategies();
        expect(stategies[StrategyEnum.POINTING_PAIR]).toBeTruthy();
    });
});

describe("difficulty reporter", () => {
    it('print difficulty report to console', () => {
        // Takes ~2 min to run so turned off by default
        if (false) {
            console.log("Difficulty Report:");
            console.log("Individual Puzzle Difficulties:");
            let min:number = 1000, max:number = 0, average:number = 0, temp:number, unsolvable:number = 0;
            for (let i:number = 0; i < difficultyBoards.length; i++) {
                try {
                    temp = (new Board(difficultyBoards[i])).getDifficulty();
                    min = Math.min(temp, min);
                    max = Math.max(temp, max);
                    average += temp;
                    console.log(temp);
                } catch (e) {
                    unsolvable++;
                }
            }
            average /= difficultyBoards.length - unsolvable;
            console.log("Difficulty Report Summary Statistics:");
            console.log("Min Difficulty: " + min);
            console.log("Max Difficulty: " + max);
            console.log("Average Difficulty: " + average);
            console.log("Was able to solve " + (difficultyBoards.length - unsolvable) + " out of " + difficultyBoards.length);
        }
    });
});