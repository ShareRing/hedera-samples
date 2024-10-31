import { isArray, isString } from "@tsed/core";
import { OnDeserialize, OnSerialize } from "@tsed/json-mapper";
import { Default, Description, For, Integer, Min, SpecTypes, array, oneOf, string } from "@tsed/schema";

export class Pageable {
  @Integer()
  @Min(1)
  @Default(1)
  @Description("Page number.")
  page = 1;

  @Integer()
  @Min(1)
  @Default(20)
  @Description("Number of objects per page.")
  size = 20;

  @For(SpecTypes.JSON, oneOf(string(), array().items(string())))
  @For(SpecTypes.OPENAPI, array().items(string()))
  @OnDeserialize((value: string | string[]) => (isString(value) ? value.split(",") : value))
  @OnSerialize((value: string | string[]) => (isArray(value) ? value.join(",") : value))
  @Description("Sorting criteria. Accepts format <prop1>,-<prop2>,... where `-` indicates sort by descending otherwise ascending.")
  sort: string | string[];

  constructor({ page, size, sort }: Partial<Pageable>) {
    if (page) {
      this.page = page;
    }
    if (size) {
      this.size = size;
    }
    if (sort) {
      this.sort = sort;
    }
  }

  get offset(): number {
    return Math.max(0, this.page - 1) * this.limit;
  }

  get limit(): number {
    return this.size;
  }

  get sorter() {
    const obj: { [k: string]: any } = {};

    if (!this.sort) {
      return {};
    }

    const s = isArray(this.sort) ? this.sort : [this.sort];

    return s.reduce((prev, curr) => {
      let direction = 1;
      if (curr.indexOf("-") === 0) {
        curr = curr.slice(1);
        direction = -1;
      }
      prev[curr] = direction;
      return prev;
    }, obj);
  }
}
