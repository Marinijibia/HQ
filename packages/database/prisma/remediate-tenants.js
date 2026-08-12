"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function remediateTenants() {
    return __awaiter(this, void 0, void 0, function () {
        var allCompanies, firstCompany, usersInFirstCompany, ownerUser, usersToMigrate, _i, usersToMigrate_1, user, rawName, cleanName, newOrgName, newOrgSlug, newCompany, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Starting Multi-Tenant Database Isolation Remediation...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, 12, 14]);
                    return [4 /*yield*/, prisma.company.findMany({
                            where: { deletedAt: null },
                            orderBy: { createdAt: 'asc' },
                        })];
                case 2:
                    allCompanies = _a.sent();
                    if (allCompanies.length === 0) {
                        console.log('No companies found in database. Clean state.');
                        return [2 /*return*/];
                    }
                    firstCompany = allCompanies[0];
                    console.log("\uD83D\uDCCC Primary Company #1 identified: \"".concat(firstCompany.name, "\" (").concat(firstCompany.id, ")"));
                    return [4 /*yield*/, prisma.user.findMany({
                            where: { companyId: firstCompany.id, deletedAt: null },
                            orderBy: { createdAt: 'asc' },
                        })];
                case 3:
                    usersInFirstCompany = _a.sent();
                    console.log("Found ".concat(usersInFirstCompany.length, " users attached to Company #1."));
                    if (!(usersInFirstCompany.length <= 1)) return [3 /*break*/, 4];
                    console.log('✅ Company #1 has 1 or 0 users. No user crosstalk remediation needed.');
                    return [3 /*break*/, 10];
                case 4:
                    ownerUser = usersInFirstCompany[0];
                    usersToMigrate = usersInFirstCompany.slice(1);
                    console.log("Keeping original owner: \"".concat(ownerUser.email, "\" (").concat(ownerUser.id, ") attached to Company #1."));
                    console.log("Remediating ".concat(usersToMigrate.length, " users to their own dedicated isolated companies..."));
                    _i = 0, usersToMigrate_1 = usersToMigrate;
                    _a.label = 5;
                case 5:
                    if (!(_i < usersToMigrate_1.length)) return [3 /*break*/, 10];
                    user = usersToMigrate_1[_i];
                    rawName = user.email ? user.email.split('@')[0] : 'User';
                    cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                    newOrgName = "".concat(cleanName, "'s Organization");
                    newOrgSlug = "".concat(cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-'), "-").concat(Math.floor(1000 + Math.random() * 9000));
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                name: newOrgName,
                                slug: newOrgSlug,
                                primaryColor: '#0A84FF',
                            },
                        })];
                case 6:
                    newCompany = _a.sent();
                    // Update user to point to their own company
                    return [4 /*yield*/, prisma.user.update({
                            where: { id: user.id },
                            data: {
                                companyId: newCompany.id,
                                role: 'ORGANIZATION_OWNER',
                            },
                        })];
                case 7:
                    // Update user to point to their own company
                    _a.sent();
                    // Provision default department
                    return [4 /*yield*/, prisma.department.create({
                            data: {
                                name: 'Executive Leadership',
                                companyId: newCompany.id,
                            },
                        })];
                case 8:
                    // Provision default department
                    _a.sent();
                    console.log("  \u2514\u2500 Created Company \"".concat(newCompany.name, "\" (").concat(newCompany.id, ") for user \"").concat(user.email, "\""));
                    _a.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10:
                    console.log('✅ Multi-Tenant Database Isolation Remediation Complete!');
                    return [3 /*break*/, 14];
                case 11:
                    err_1 = _a.sent();
                    console.error('❌ Remediation error:', err_1);
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, prisma.$disconnect()];
                case 13:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
remediateTenants();
